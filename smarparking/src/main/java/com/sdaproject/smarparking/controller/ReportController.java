package com.sdaproject.smarparking.controller;

import com.sdaproject.smarparking.service.ReportService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue() {
        return ResponseEntity.ok(reportService.getRevenueReport());
    }

    @GetMapping("/occupancy")
    public ResponseEntity<?> getOccupancy() {
        return ResponseEntity.ok(reportService.getOccupancyReport());
    }

    @GetMapping("/site-utilization")
    public ResponseEntity<?> getSiteUtilization() {
        return ResponseEntity.ok(reportService.getSiteUtilizationReport());
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv() {
        Map<String, Object> revenue = reportService.getRevenueReport();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> byDay = (List<Map<String, Object>>) revenue.get("byDay");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> bySite = (List<Map<String, Object>>) revenue.get("bySite");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> byMonth = (List<Map<String, Object>>) revenue.get("byMonth");
        List<Map<String, Object>> occupancy = reportService.getOccupancyReport();

        StringBuilder csv = new StringBuilder();
        csv.append("Section,Label,Value\n");
        csv.append("Summary,Generated At,").append(LocalDateTime.now()).append("\n");

        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) revenue.get("summary");
        csv.append("Summary,Total Revenue,").append(summary.get("totalRevenue")).append("\n");
        csv.append("Summary,Paid Sessions,").append(summary.get("paidSessions")).append("\n");
        csv.append("Summary,Unpaid Sessions,").append(summary.get("unpaidSessions")).append("\n");
        csv.append("Summary,Top Site,").append(summary.get("topSite")).append("\n");

        for (Map<String, Object> row : byDay) {
            csv.append("Daily Revenue,")
                    .append(row.get("day")).append(",")
                    .append(row.get("revenue")).append("\n");
        }
        for (Map<String, Object> row : bySite) {
            csv.append("Site Revenue,")
                    .append(row.get("name")).append(",")
                    .append(row.get("value")).append("\n");
        }
        for (Map<String, Object> row : byMonth) {
            csv.append("Monthly Revenue,")
                    .append(row.get("month")).append(",")
                    .append(row.get("revenue")).append("\n");
        }
        for (Map<String, Object> row : occupancy) {
            csv.append("Occupancy,")
                    .append(row.get("hour")).append(",")
                    .append(row.get("occupancy")).append("\n");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=smartpark-report.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        return ResponseEntity.ok().headers(headers).body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdf() throws IOException {
        Map<String, Object> revenue = reportService.getRevenueReport();
        List<Map<String, Object>> occupancy = reportService.getOccupancyReport();

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 16);
                content.newLineAtOffset(50, 780);
                content.showText("SmartPark Revenue Report");

                content.setFont(PDType1Font.HELVETICA, 11);
                content.newLineAtOffset(0, -24);
                content.showText("Generated: " + LocalDateTime.now());

                @SuppressWarnings("unchecked")
                Map<String, Object> summary = (Map<String, Object>) revenue.get("summary");
                content.newLineAtOffset(0, -20);
                content.showText("Total Revenue: Rs. " + summary.get("totalRevenue"));
                content.newLineAtOffset(0, -16);
                content.showText("Paid Sessions: " + summary.get("paidSessions"));
                content.newLineAtOffset(0, -16);
                content.showText("Unpaid Sessions: " + summary.get("unpaidSessions"));
                content.newLineAtOffset(0, -16);
                content.showText("Top Site: " + summary.get("topSite"));

                content.newLineAtOffset(0, -24);
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.showText("Peak Times Snapshot");
                content.setFont(PDType1Font.HELVETICA, 10);

                int limit = Math.min(10, occupancy.size());
                for (int i = 0; i < limit; i++) {
                    Map<String, Object> row = occupancy.get(i);
                    content.newLineAtOffset(0, -14);
                    content.showText(row.get("hour") + " -> " + row.get("occupancy"));
                }
                content.endText();
            }

            document.save(output);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=smartpark-report.pdf");
        headers.setContentType(MediaType.APPLICATION_PDF);
        return ResponseEntity.ok().headers(headers).body(output.toByteArray());
    }
}
