// Generador nativo de archivos Excel (.xlsx - OpenXML) sin dependencias externas.
// Construye un paquete ZIP estándar con estilos, anchos de columna y tipos numéricos/texto.

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    tabla[n] = c >>> 0
  }
  return tabla
})()

function crc32(bytes) {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    c = TABLA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function escaparXml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function nombreColumna(indice) {
  let col = ''
  let n = indice + 1
  while (n > 0) {
    const resto = (n - 1) % 26
    col = String.fromCharCode(65 + resto) + col
    n = Math.floor((n - 1) / 26)
  }
  return col
}

// Empaqueta una lista de archivos [{ ruta, contenido }] en un Uint8Array ZIP válido
function crearZip(archivos) {
  const encoder = new TextEncoder()
  const entradas = archivos.map((a) => {
    const nombreBytes = encoder.encode(a.ruta)
    const datosBytes = encoder.encode(a.contenido)
    const crc = crc32(datosBytes)
    return { nombreBytes, datosBytes, crc, offset: 0 }
  })

  let tamanoLocal = 0
  for (const e of entradas) {
    e.offset = tamanoLocal
    tamanoLocal += 30 + e.nombreBytes.length + e.datosBytes.length
  }

  let tamanoCentral = 0
  for (const e of entradas) {
    tamanoCentral += 46 + e.nombreBytes.length
  }

  const buffer = new ArrayBuffer(tamanoLocal + tamanoCentral + 22)
  const vista = new DataView(buffer)
  const salida = new Uint8Array(buffer)
  let pos = 0

  for (const e of entradas) {
    vista.setUint32(pos, 0x04034b50, true); pos += 4 // Local file header signature
    vista.setUint16(pos, 20, true); pos += 2         // Version needed to extract (2.0)
    vista.setUint16(pos, 0x0800, true); pos += 2     // General purpose bit flag (UTF-8)
    vista.setUint16(pos, 0, true); pos += 2          // Compression method (0 = store)
    vista.setUint16(pos, 0, true); pos += 2          // Last mod file time
    vista.setUint16(pos, 0x5967, true); pos += 2     // Last mod file date
    vista.setUint32(pos, e.crc, true); pos += 4      // CRC-32
    vista.setUint32(pos, e.datosBytes.length, true); pos += 4 // Compressed size
    vista.setUint32(pos, e.datosBytes.length, true); pos += 4 // Uncompressed size
    vista.setUint16(pos, e.nombreBytes.length, true); pos += 2 // File name length
    vista.setUint16(pos, 0, true); pos += 2          // Extra field length
    salida.set(e.nombreBytes, pos); pos += e.nombreBytes.length
    salida.set(e.datosBytes, pos); pos += e.datosBytes.length
  }

  const inicioCentral = pos
  for (const e of entradas) {
    vista.setUint32(pos, 0x02014b50, true); pos += 4 // Central file header signature
    vista.setUint16(pos, 20, true); pos += 2         // Version made by
    vista.setUint16(pos, 20, true); pos += 2         // Version needed
    vista.setUint16(pos, 0x0800, true); pos += 2     // UTF-8 flag
    vista.setUint16(pos, 0, true); pos += 2          // Compression method (store)
    vista.setUint16(pos, 0, true); pos += 2          // Mod time
    vista.setUint16(pos, 0x5967, true); pos += 2     // Mod date
    vista.setUint32(pos, e.crc, true); pos += 4      // CRC-32
    vista.setUint32(pos, e.datosBytes.length, true); pos += 4 // Compressed size
    vista.setUint32(pos, e.datosBytes.length, true); pos += 4 // Uncompressed size
    vista.setUint16(pos, e.nombreBytes.length, true); pos += 2 // File name length
    vista.setUint16(pos, 0, true); pos += 2          // Extra field length
    vista.setUint16(pos, 0, true); pos += 2          // File comment length
    vista.setUint16(pos, 0, true); pos += 2          // Disk number start
    vista.setUint16(pos, 0, true); pos += 2          // Internal file attributes
    vista.setUint32(pos, 0, true); pos += 4          // External file attributes
    vista.setUint32(pos, e.offset, true); pos += 4   // Relative offset of local header
    salida.set(e.nombreBytes, pos); pos += e.nombreBytes.length
  }

  // End of central directory record
  vista.setUint32(pos, 0x06054b50, true); pos += 4
  vista.setUint16(pos, 0, true); pos += 2
  vista.setUint16(pos, 0, true); pos += 2
  vista.setUint16(pos, entradas.length, true); pos += 2
  vista.setUint16(pos, entradas.length, true); pos += 2
  vista.setUint32(pos, tamanoCentral, true); pos += 4
  vista.setUint32(pos, inicioCentral, true); pos += 4
  vista.setUint16(pos, 0, true); pos += 2

  return salida
}

/**
 * Descarga un archivo .xlsx con formato y estilos.
 * @param {string} nombreArchivo - Nombre del archivo (ej: 'reporte-maquinas.xlsx')
 * @param {string} nombreHoja - Nombre de la pestaña
 * @param {Array<{ estilo?: number, celdas: Array<string|number|{v: any, s?: number}> }>} filas
 * @param {Array<number>} anchosColumna - Anchos sugeridos para cada columna
 */
export function descargarXlsx(nombreArchivo, nombreHoja, filas, anchosColumna = []) {
  const colsXml =
    anchosColumna.length > 0
      ? `<cols>${anchosColumna
          .map((ancho, idx) => `<col min="${idx + 1}" max="${idx + 1}" width="${ancho}" customWidth="1"/>`)
          .join('')}</cols>`
      : ''

  const filasXml = filas
    .map((fila, idxFila) => {
      const nroFila = idxFila + 1
      const celdas = fila.celdas ?? fila
      const estiloFila = fila.estilo ?? 0
      const celdasXml = celdas
        .map((celda, idxCol) => {
          const ref = `${nombreColumna(idxCol)}${nroFila}`
          const esObj = celda !== null && typeof celda === 'object'
          const valor = esObj ? celda.v : celda
          const s = esObj && celda.s !== undefined ? celda.s : estiloFila
          if (valor === null || valor === undefined || valor === '') {
            return s ? `<c r="${ref}" s="${s}"/>` : `<c r="${ref}"/>`
          }
          if (typeof valor === 'number' && !Number.isNaN(valor)) {
            return `<c r="${ref}" s="${s}" t="n"><v>${valor}</v></c>`
          }
          return `<c r="${ref}" s="${s}" t="inlineStr"><is><t>${escaparXml(valor)}</t></is></c>`
        })
        .join('')
      return `<row r="${nroFila}">${celdasXml}</row>`
    })
    .join('')

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${colsXml}
  <sheetData>${filasXml}</sheetData>
</worksheet>`

  // Estilos:
  // 0 = Normal
  // 1 = Título de Bloque (Fondo oscuro #1E293B, texto blanco negrita)
  // 2 = Encabezado de Tabla (Fondo verde Lavandus #42855E, texto blanco negrita, borde)
  // 3 = Celda de datos con borde suave
  // 4 = Etiqueta en negrita con fondo gris suave (#F1F5F9) y borde
  // 5 = Celda de moneda ($ ARS) con borde
  // 6 = Celda de peso/capacidad (kg) con borde
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="2">
    <numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0"/>
    <numFmt numFmtId="165" formatCode="#,##0.##&quot; kg&quot;"/>
  </numFmts>
  <fonts count="3">
    <font><sz val="11"/><color rgb="FF1F2933"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FF1F2933"/><name val="Calibri"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E293B"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF42855E"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="7">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="1" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escaparXml(nombreHoja)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

  const bytesZip = crearZip([
    { ruta: '[Content_Types].xml', contenido: contentTypesXml },
    { ruta: '_rels/.rels', contenido: rootRelsXml },
    { ruta: 'xl/workbook.xml', contenido: workbookXml },
    { ruta: 'xl/_rels/workbook.xml.rels', contenido: workbookRelsXml },
    { ruta: 'xl/styles.xml', contenido: stylesXml },
    { ruta: 'xl/worksheets/sheet1.xml', contenido: sheetXml },
  ])

  const blob = new Blob([bytesZip], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
