package com.lavandus.api.service;

import com.lavandus.api.model.DetalleSolicitud;
import com.lavandus.api.model.Servicio;
import com.lavandus.api.model.Solicitud;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

// Genera el PDF de la factura de un servicio con OpenPDF.
// Toda la dependencia de OpenPDF queda encapsulada acá.
@Service
public class FacturaPdfService {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Locale LOCALE_MONEDA = Locale.of("es", "AR");

    @Value("${lavandus.facturas.dir}")
    private String directorio;

    // Genera el PDF y devuelve la ruta del archivo creado.
    public String generar(Servicio servicio, LocalDateTime fechaEmision) {
        try {
            Path carpeta = Paths.get(directorio);
            Files.createDirectories(carpeta);
            Path archivo = carpeta.resolve("factura-" + servicio.getIdServicio() + ".pdf");

            Solicitud solicitud = servicio.getSolicitud();

            Font titulo = FontFactory.getFont(FontFactory.HELVETICA, 22, Font.BOLD);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 11, Font.NORMAL);
            Font negrita = FontFactory.getFont(FontFactory.HELVETICA, 12, Font.BOLD);

            Document documento = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(documento, new FileOutputStream(archivo.toFile()));
            documento.open();

            documento.add(new Paragraph("Lavandus", titulo));
            documento.add(new Paragraph("Factura de servicio N° " + servicio.getIdServicio(), negrita));
            documento.add(new Paragraph("Fecha de emisión: " + fechaEmision.format(FECHA), normal));
            documento.add(new Paragraph(" "));

            documento.add(new Paragraph("Datos del cliente", negrita));
            documento.add(new Paragraph("Nombre: " + solicitud.getNombreCliente(), normal));
            documento.add(new Paragraph("Razón social: " + solicitud.getRazonSocial(), normal));
            documento.add(new Paragraph("Email: " + solicitud.getEmail(), normal));
            documento.add(new Paragraph(" "));

            documento.add(new Paragraph("Datos del servicio", negrita));
            documento.add(new Paragraph("Fecha de alta: " + servicio.getFechaAlta().format(FECHA), normal));
            documento.add(new Paragraph(
                    "Empleado a cargo: " + servicio.getEmpleado().getNombre() + " "
                            + servicio.getEmpleado().getApellido(), normal));
            if (servicio.getMaquina() != null) {
                documento.add(new Paragraph("Máquina N° " + servicio.getMaquina().getIdMaquina(), normal));
            }
            documento.add(new Paragraph(" "));

            PdfPTable tabla = new PdfPTable(new float[] { 4f, 2f, 3f, 3f });
            tabla.setWidthPercentage(100);
            agregarCelda(tabla, "Prenda", true);
            agregarCelda(tabla, "Cantidad", true);
            agregarCelda(tabla, "Precio unitario", true);
            agregarCelda(tabla, "Subtotal", true);

            for (DetalleSolicitud detalle : solicitud.getDetalles()) {
                BigDecimal precio = detalle.getTipoPrenda().getPrecio();
                BigDecimal subtotal = precio.multiply(BigDecimal.valueOf(detalle.getCantidad()));
                agregarCelda(tabla, detalle.getTipoPrenda().getNombre(), false);
                agregarCelda(tabla, String.valueOf(detalle.getCantidad()), false);
                agregarCelda(tabla, formatearMoneda(precio), false);
                agregarCelda(tabla, formatearMoneda(subtotal), false);
            }
            documento.add(tabla);
            documento.add(new Paragraph(" "));

            Paragraph total = new Paragraph("Total: " + formatearMoneda(solicitud.getPrecioEstimado()), negrita);
            total.setAlignment(Element.ALIGN_RIGHT);
            documento.add(total);

            documento.close();
            return archivo.toString();
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo generar el PDF de la factura: " + e.getMessage(), e);
        }
    }

    private void agregarCelda(PdfPTable tabla, String texto, boolean encabezado) {
        Font fuente = FontFactory.getFont(FontFactory.HELVETICA, encabezado ? 11 : 10,
                encabezado ? Font.BOLD : Font.NORMAL);
        PdfPCell celda = new PdfPCell(new Paragraph(texto, fuente));
        celda.setPadding(6);
        tabla.addCell(celda);
    }

    private String formatearMoneda(BigDecimal valor) {
        return NumberFormat.getCurrencyInstance(LOCALE_MONEDA).format(valor);
    }
}
