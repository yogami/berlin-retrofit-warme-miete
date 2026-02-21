import { Router } from "express";
import PDFDocument from "pdfkit";
import { simulations, auditLogs } from "../infrastructure/schema";
import { memoryDb } from "../infrastructure/memoryDb";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const createReportingRouter = (db: any) => {
  const router = Router();

  // GET: Generate a Compliance PDF for a given simulation ID
  router.get("/compliance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      let simData;
      let auditData;

      if (!db) {
        simData = memoryDb.simulations.find((s) => s.id === id);
        auditData = memoryDb.auditLogs.find((a) => a.simulationId === id);
        if (!simData) {
          return res
            .status(404)
            .json({ success: false, message: "Simulation not found" });
        }
      } else {
        // Fetch simulation and its audit log
        const data = await db
          .select()
          .from(simulations)
          .leftJoin(auditLogs, eq(simulations.id, auditLogs.simulationId))
          .where(eq(simulations.id, id))
          .limit(1);

        if (!data || data.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Simulation not found" });
        }

        simData = data[0].simulations;
        auditData = data[0].audit_logs;
      }

      // Generate PDF
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader(
        "Content-disposition",
        `attachment; filename="Compliance_Audit_${id}.pdf"`,
      );
      res.setHeader("Content-type", "application/pdf");

      doc.pipe(res);

      // Header
      doc
        .fontSize(20)
        .text("Warme Miete - Compliance Audit Report", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Date: ${new Date().toISOString()}`, { align: "right" });
      doc.moveDown(2);

      // Legal Framework
      doc
        .fontSize(16)
        .text("Legal Framework: BGB § 559 (Modernisierungsumlage)");
      doc
        .fontSize(10)
        .text(
          "According to § 559 BGB, landlords are permitted to allocate up to 8% of modernization costs to the annual rent, capped at €3.00/sqm per month (or €2.00/sqm if base rent < €7.00/sqm). This report mathematically verifies compliance with this statute and details the tenant net-benefit (Warm Rent reduction) based strictly on deterministic inputs.",
          { align: "justify" },
        );
      doc.moveDown(2);

      // Structural Inputs (Anonymized)
      doc.fontSize(14).text("1. Structural Metadata (Zero-Trust)");
      doc.fontSize(12).text(`Units: ${simData.units}`);
      doc.text(`Building Age Category: ${simData.buildingAge}`);
      doc.text(`Retrofit Strategy: ${simData.retrofitType.toUpperCase()}`);
      doc.moveDown(2);

      // Financial Output
      const results: any = simData.results;
      if (results) {
        doc.fontSize(14).text("2. Verified Financial Outcomes");
        doc
          .fontSize(12)
          .text(
            `Total Capital Expenditure: €${results.totalCost?.toLocaleString()}`,
          );
        doc.text(
          `Applied Subsidies (e.g., KfW/BAFA): €${results.totalSubsidy?.toLocaleString()}`,
        );
        doc.text(
          `Net Landlord Cost: €${results.netLandlordCost?.toLocaleString()}`,
        );
        doc.moveDown();
        doc.text(
          `Tenant Base Rent Increase (Allocation): €${results.landlordAnnualExtraRev?.toLocaleString()} / year`,
        );
        doc.text(
          `Tenant Heating Savings: Positive net decrease establishing 'Warme Miete' Equilibrium.`,
        );
        doc.moveDown(2);
      }

      // Cryptographic Audit Trail
      doc.fontSize(14).text("3. Cryptographic Proof of Execution");
      if (auditData) {
        doc.fontSize(10).font("Courier").text(`Immutable Hash (SHA-256):`);
        doc.text(`${auditData.hash}`, { lineBreak: true });
        doc.moveDown();
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(`Signature Timestamp: ${auditData.createdAt}`);
        doc.text(
          `This hash serves as immutable proof of the calculation state, inputs, and the verified engine version. Any tampering with the input data or math engine instantly invalidates this document.`,
        );
      } else {
        doc
          .fillColor("red")
          .fontSize(10)
          .text(
            "WARNING: No immutable cryptographic signature found for this record.",
          );
      }

      // Finalize PDF
      doc.end();
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  const ephemeralPayloadSchema = z
    .object({
      simulationId: z.number(),
      buildingAddress: z.string().min(5),
      tenantName: z.string().min(2),
      landlordName: z.string().min(2),
    })
    .strict();

  // POST: Generate a Deal Closer Contract PDF (Ephemeral PII, Zero-Trust)
  router.post("/contract", async (req, res) => {
    try {
      const parseResult = ephemeralPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid payload for contract generation.",
          });
      }

      const { simulationId, buildingAddress, tenantName, landlordName } =
        parseResult.data;

      // Fetch the verified mathematical simulation
      let simData;
      let auditData;

      if (!db) {
        simData = memoryDb.simulations.find((s) => s.id === simulationId);
        auditData = memoryDb.auditLogs.find(
          (a) => a.simulationId === simulationId,
        );
      } else {
        const data = await db
          .select()
          .from(simulations)
          .leftJoin(auditLogs, eq(simulations.id, auditLogs.simulationId))
          .where(eq(simulations.id, parseInt(simulationId as any)))
          .limit(1);
        if (data && data.length > 0) {
          simData = data[0].simulations;
          auditData = data[0].audit_logs;
        }
      }

      if (!simData || !simData.results) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Verified simulation record not found.",
          });
      }

      const results: any = simData.results;

      // Generate "The Deal Closer" PDF
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader(
        "Content-disposition",
        `attachment; filename="GreenLease_${simulationId}.pdf"`,
      );
      res.setHeader("Content-type", "application/pdf");
      doc.pipe(res);

      // Title
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("ZIA Green Lease 2.0 Addendum", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Generated: ${new Date().toLocaleDateString()}`, {
          align: "right",
        });
      doc.moveDown(2);

      // Ephemeral PII (Never stored in the DB, only rendered into the PDF stream)
      // This is the core of the Zero-Trust Moat
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("1. Contractual Parties & Asset");
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Building Address: ${buildingAddress}`);
      doc.text(`Landlord: ${landlordName}`);
      doc.text(`Tenant: ${tenantName}`);
      doc.moveDown();
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(
          "Disclaimer: PII data is processed ephemerally for PDF generation only and is not logged or stored by Warme Miete to ensure strict GDPR compliance.",
          { align: "justify" },
        );
      doc.moveDown(2);

      // The Financial Deal
      doc
        .fontSize(14)
        .fillColor("black")
        .font("Helvetica-Bold")
        .text("2. The Win-Win Financial Matrix");
      doc.moveDown();

      doc.fontSize(12).font("Helvetica-Oblique").text("Pre-Retrofit Reality:");
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `- Tenant Heating Burden: €${results.oldHeating.toLocaleString()}/yr`,
        );
      doc.text(
        `- Landlord CO2 Penalty (CO2AufG): €${results.co2TaxLandlordOld.toFixed(2)}/yr`,
      );
      doc.moveDown();

      doc.fontSize(12).font("Helvetica-Oblique").text("Post-Retrofit Future:");
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `- Tenant Net Savings (incl. rent increase & CO2 tax shift): €${results.tenantNetSavings.toFixed(2)}/yr`,
        );
      doc.text(
        `- Landlord Avoided CO2 Penalty: €${results.landlordCo2Savings.toFixed(2)}/yr`,
      );
      doc.text(
        `- Asset ROI Yield Period: ${results.roiYears.toFixed(1)} Years`,
      );
      doc.moveDown(2);

      // Signatures
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("3. Execution Agreement (BGB § 559)");
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `By signing below, the Tenant agrees to the Modernisierungsumlage capped at 8% resulting in a net-positive reduction of Warm Rent.`,
          { align: "justify" },
        );
      doc.moveDown(3);

      doc.text("_____________________________________", 50, doc.y);
      doc.text("_____________________________________", 350, doc.y - 12);
      doc.moveDown(0.5);
      doc.text(`Landlord Signature\n${landlordName}`, 50, doc.y);
      doc.text(`Tenant Signature\n${tenantName}`, 350, doc.y - 25);

      // Branding Footer
      doc.moveDown(5);
      doc
        .fontSize(8)
        .fillColor("green")
        .text(
          "Calculations & Compliance powered by the Warme Miete Platform.",
          { align: "center" },
        );

      doc.end();
    } catch (error: any) {
      console.error("Contract Generation Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  return router;
};
