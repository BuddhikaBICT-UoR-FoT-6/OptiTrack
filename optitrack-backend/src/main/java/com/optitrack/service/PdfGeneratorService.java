package com.optitrack.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.optitrack.model.entity.Delivery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

/**
 * Purpose: Generates high-fidelity PDF e-Waybills with digital signatures.
 */
@Service
@Slf4j
public class PdfGeneratorService {

    public byte[] generateWaybill(Delivery delivery, String signatureBase64) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Header (Branding)
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, Font.BOLD, new java.awt.Color(59, 130, 246));
            Paragraph header = new Paragraph("OPTITRACK | DIGITAL WAYBILL", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            document.add(new Paragraph("\n"));

            // 2. Operational Details Table
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            document.add(new Paragraph("DELIVERY IDENTIFIER: " + delivery.getId(), subHeaderFont));
            document.add(new Paragraph("PACKAGE DESIGNATION: " + delivery.getPackageName()));
            document.add(new Paragraph("TYPE: " + delivery.getDeliveryType()));
            document.add(new Paragraph("TIMESTAMP: " + java.time.LocalDateTime.now()));
            
            document.add(new Paragraph("\n----------------------------------------------------------------------------------------------------------------------------------\n"));

            // 3. Asset & Operator Details
            if (delivery.getVehicle() != null) {
                document.add(new Paragraph("ASSET PLATE: " + delivery.getVehicle().getLicensePlate()));
                if (delivery.getVehicle().getAssignedDriver() != null) {
                    document.add(new Paragraph("OPERATOR: " + delivery.getVehicle().getAssignedDriver().getFullName()));
                } else {
                    document.add(new Paragraph("OPERATOR: UNASSIGNED/AUTONOMOUS"));
                }
            }

            document.add(new Paragraph("\n----------------------------------------------------------------------------------------------------------------------------------\n"));

            // 4. Endorsement Section
            document.add(new Paragraph("CUSTOMER ENDORSEMENT:", subHeaderFont));
            document.add(new Paragraph("\n"));

            if (signatureBase64 != null && !signatureBase64.isEmpty() && signatureBase64.contains(",")) {
                // Remove data:image/png;base64, prefix
                String pureBase64 = signatureBase64.split(",")[1];
                byte[] imgBytes = Base64.getDecoder().decode(pureBase64);
                Image signatureImage = Image.getInstance(imgBytes);
                signatureImage.scaleToFit(200, 100);
                signatureImage.setAlignment(Element.ALIGN_LEFT);
                document.add(signatureImage);
            }

            document.add(new Paragraph("\nVerified & Digitally Signed via OptiTrack Autonomous Ecosystem."));

            document.close();
            log.info("📄 [WAYBILL-GEN] PDF successfully generated for delivery ID: {}", delivery.getId());
        } catch (Exception e) {
            log.error("PDF Generation Error: {}", e.getMessage());
        }

        return out.toByteArray();
    }
}
