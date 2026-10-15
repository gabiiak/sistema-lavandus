package com.lavandus.api.service;

import com.lavandus.api.model.Factura;
import com.lavandus.api.model.FacturaEstado;
import com.lavandus.api.model.Servicio;
import com.lavandus.api.repository.FacturaRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.util.Optional;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Verifica el envío de facturas sin depender de un SMTP real (JavaMailSender mockeado).
@ExtendWith(MockitoExtension.class)
class FacturaServiceTest {

    @Mock
    private FacturaRepository facturaRepository;

    @Mock
    private FacturaPdfService facturaPdfService;

    @Mock
    private ObjectProvider<JavaMailSender> mailSenderProvider;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private FacturaService facturaService;

    private File pdf;

    @BeforeEach
    void setUp() throws Exception {
        ReflectionTestUtils.setField(facturaService, "mailHost", "smtp.test.com");
        ReflectionTestUtils.setField(facturaService, "remitente", "facturacion@lavandus.com");
        pdf = File.createTempFile("factura-", ".pdf");
        pdf.deleteOnExit();
    }

    private Factura facturaDePrueba(String email) {
        Servicio servicio = new Servicio();
        servicio.setIdServicio(1);

        Factura factura = new Factura();
        factura.setIdFactura(10);
        factura.setServicio(servicio);
        factura.setEmailDestino(email);
        factura.setRutaArchivo(pdf.getAbsolutePath());
        factura.setEstado(FacturaEstado.NO_ENVIADA);

        when(facturaRepository.findByServicioIdServicio(1)).thenReturn(Optional.of(factura));
        return factura;
    }

    @Test
    void enviarMarcaEnviada() throws Exception {
        Factura factura = facturaDePrueba("cliente@cualquier-dominio.com");
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        when(mailSender.createMimeMessage())
                .thenReturn(new MimeMessage(Session.getInstance(new Properties())));

        var respuesta = facturaService.enviar(1);

        assertEquals(FacturaEstado.ENVIADA, respuesta.getEstado());
        verify(mailSender).send(any(MimeMessage.class));
        verify(facturaRepository).save(factura);
    }

    @Test
    void enviarSinSmtpConfiguradoDevuelve400() {
        Factura factura = facturaDePrueba("cliente@cualquier-dominio.com");
        ReflectionTestUtils.setField(facturaService, "mailHost", "");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> facturaService.enviar(1));

        assertTrue(ex.getMessage().contains("no está configurado"));
        assertEquals(FacturaEstado.NO_ENVIADA, factura.getEstado());
    }
}
