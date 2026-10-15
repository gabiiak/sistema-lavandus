package com.lavandus.api.service;

import com.lavandus.api.dto.FacturaResponse;
import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.Factura;
import com.lavandus.api.model.FacturaEstado;
import com.lavandus.api.model.Servicio;
import com.lavandus.api.repository.FacturaRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

// Emisión y envío de facturas de servicio (LDUS-54).
@Service
public class FacturaService {

    @Autowired
    private FacturaRepository facturaRepository;

    @Autowired
    private FacturaPdfService facturaPdfService;

    // El JavaMailSender solo existe si hay SMTP configurado (spring.mail.host)
    @Autowired
    private ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${lavandus.facturas.remitente}")
    private String remitente;

    // Se llama cuando un servicio pasa a TERMINADO. Nunca lanza: si algo falla,
    // el servicio igual queda terminado y la factura queda NO_ENVIADA.
    public void emitirPorTerminado(Servicio servicio) {
        try {
            if (facturaRepository.existsByServicioIdServicio(servicio.getIdServicio())) {
                return;
            }

            Factura factura = new Factura();
            factura.setServicio(servicio);
            factura.setEmailDestino(servicio.getSolicitud().getEmail());
            factura.setFechaEmision(LocalDateTime.now());
            factura.setEstado(FacturaEstado.NO_ENVIADA);
            factura.setRutaArchivo(facturaPdfService.generar(servicio, factura.getFechaEmision()));

            try {
                enviarCorreo(factura);
            } catch (Exception e) {
                factura.setEstado(FacturaEstado.NO_ENVIADA);
                factura.setMensajeError(recortar(mensajeDe(e)));
            }

            facturaRepository.save(factura);
        } catch (Exception e) {
            // No interrumpimos el cambio de estado del servicio.
        }
    }

    // Factura de un servicio (solo ADMIN)
    @Transactional(readOnly = true)
    public FacturaResponse obtenerPorServicio(Integer idServicio) {
        return aRespuesta(buscarPorServicio(idServicio));
    }

    // PDF de la factura para descargar (solo ADMIN)
    @Transactional(readOnly = true)
    public Resource obtenerPdf(Integer idServicio) {
        Factura factura = buscarPorServicio(idServicio);
        Path ruta = Paths.get(factura.getRutaArchivo());
        if (!Files.exists(ruta)) {
            throw new RecursoNoEncontradoException(
                    "El archivo de la factura del servicio " + idServicio + " no existe");
        }
        return new FileSystemResource(ruta);
    }

    // Reintenta el envío manualmente (solo ADMIN). Lanza 400 si ya fue enviada o no hay SMTP.
    @Transactional
    public FacturaResponse enviar(Integer idServicio) {
        Factura factura = buscarPorServicio(idServicio);

        if (factura.getEstado() == FacturaEstado.ENVIADA) {
            throw new IllegalArgumentException("La factura del servicio " + idServicio + " ya fue enviada");
        }

        try {
            enviarCorreo(factura);
        } catch (IllegalStateException e) {
            throw new IllegalArgumentException(e.getMessage());
        } catch (Exception e) {
            factura.setEstado(FacturaEstado.NO_ENVIADA);
            factura.setMensajeError(recortar(mensajeDe(e)));
            facturaRepository.save(factura);
            throw new IllegalArgumentException("No se pudo enviar la factura: " + recortar(mensajeDe(e)));
        }

        facturaRepository.save(factura);
        return aRespuesta(factura);
    }

    // Envía el PDF por correo y marca la factura como ENVIADA. Lanza si no se puede.
    private void enviarCorreo(Factura factura) {
        if (!StringUtils.hasText(mailHost)) {
            throw new IllegalStateException("El servidor de correo no está configurado");
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new IllegalStateException("El servidor de correo no está configurado");
        }

        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(remitente);
            helper.setTo(factura.getEmailDestino());
            helper.setSubject("Factura del servicio N° " + factura.getServicio().getIdServicio() + " - Lavandus");
            helper.setText("Hola, adjuntamos la factura del servicio de lavado realizado. Saludos, Lavandus.");
            File archivo = new File(factura.getRutaArchivo());
            helper.addAttachment(archivo.getName(), archivo);
            mailSender.send(mime);

            factura.setEstado(FacturaEstado.ENVIADA);
            factura.setFechaEnvio(LocalDateTime.now());
            factura.setMensajeError(null);
        } catch (Exception e) {
            throw new IllegalStateException(mensajeDe(e), e);
        }
    }

    private Factura buscarPorServicio(Integer idServicio) {
        return facturaRepository.findByServicioIdServicio(idServicio)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "El servicio con id " + idServicio + " no tiene factura"));
    }

    private FacturaResponse aRespuesta(Factura factura) {
        return new FacturaResponse(
                factura.getIdFactura(),
                factura.getServicio().getIdServicio(),
                factura.getEstado(),
                factura.getEmailDestino(),
                factura.getFechaEmision(),
                factura.getFechaEnvio(),
                factura.getMensajeError());
    }

    private String mensajeDe(Exception e) {
        return e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
    }

    private String recortar(String mensaje) {
        if (mensaje == null) {
            return null;
        }
        return mensaje.length() > 500 ? mensaje.substring(0, 500) : mensaje;
    }
}
