import PDFDocument from 'pdfkit';

/**
 * Generates a professional Lease Agreement PDF and pipes it to a writable stream.
 *
 * @param {Object} data  – lease data object (from getTenantLease + populations)
 * @param {import('stream').Writable} stream – response or file stream
 */
export function generateLeasePdf(data, stream) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    info: {
      Title: `Lease Agreement – ${data.unitLabel || 'Unit'}`,
      Author: 'JPTL Property Management',
      Subject: 'Residential Lease Agreement',
    },
  });

  doc.pipe(stream);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const accentColor = '#4F46E5'; // indigo-600

  // ── Helper: horizontal rule ──
  const hr = (y) => {
    doc
      .moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .strokeColor('#CBD5E1')
      .lineWidth(0.5)
      .stroke();
  };

  // ── Helper: section heading ──
  const sectionHeading = (label) => {
    doc.moveDown(0.8);
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(accentColor)
      .text(label.toUpperCase(), { underline: false });
    doc.moveDown(0.3);
    hr(doc.y);
    doc.moveDown(0.5);
  };

  // ── Helper: key-value row ──
  const kvRow = (key, value) => {
    const y = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748B')
      .text(key, doc.page.margins.left, y, { width: 180, continued: false });
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#0F172A')
      .text(String(value ?? '—'), doc.page.margins.left + 190, y, {
        width: pageWidth - 190,
      });
    doc.moveDown(0.25);
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fmtCurrency = (n) => {
    if (n == null) return '—';
    return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // ══════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .fillColor(accentColor)
    .text('RESIDENTIAL LEASE AGREEMENT', { align: 'center' });

  doc.moveDown(0.2);
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#94A3B8')
    .text('JPTL Property Management System  •  Official Contract Document', {
      align: 'center',
    });

  doc.moveDown(0.4);
  hr(doc.y);
  doc.moveDown(0.6);

  // ── Reference ──
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#94A3B8')
    .text(`Agreement ID: ${data.id || data._id || 'N/A'}`, { align: 'right' });
  doc
    .text(`Generated: ${fmtDate(new Date())}`, { align: 'right' });
  doc.moveDown(0.4);

  // ══════════════════════════════════════════════════════════════
  // 1. PARTIES
  // ══════════════════════════════════════════════════════════════
  sectionHeading('1. Parties to the Agreement');

  kvRow('Landlord', data.landlordName || '—');
  kvRow('Tenant', data.tenantName || '—');

  // ══════════════════════════════════════════════════════════════
  // 2. PROPERTY DETAILS
  // ══════════════════════════════════════════════════════════════
  sectionHeading('2. Property & Unit Details');

  kvRow('Property Name', data.propertyName || '—');
  kvRow('Property Address', data.propertyAddress || '—');
  kvRow('Unit', data.unitLabel || '—');
  if (data.unitBedrooms || data.unitBathrooms || data.unitSqft) {
    kvRow(
      'Floor Plan',
      [
        data.unitBedrooms ? `${data.unitBedrooms} Bedroom(s)` : null,
        data.unitBathrooms ? `${data.unitBathrooms} Bathroom(s)` : null,
        data.unitSqft ? `${data.unitSqft} sq ft` : null,
      ]
        .filter(Boolean)
        .join('  ·  ')
    );
  }
  if (data.hasParking) {
    kvRow('Parking', `Spot ${data.parkingSpot || 'Assigned'} — ${fmtCurrency(data.parkingFee)}/mo`);
  }

  // ══════════════════════════════════════════════════════════════
  // 3. LEASE TERM
  // ══════════════════════════════════════════════════════════════
  sectionHeading('3. Lease Term');

  kvRow('Commencement Date', fmtDate(data.leaseStart));
  kvRow('Expiration Date', data.leaseType === 'indefinite' ? 'No fixed expiration date' : fmtDate(data.leaseEnd));

  if (data.leaseType === 'indefinite') {
    kvRow('Duration', 'Indefinite');
  } else if (data.leaseStart && data.leaseEnd) {
    const months = Math.round(
      (new Date(data.leaseEnd) - new Date(data.leaseStart)) /
        (1000 * 60 * 60 * 24 * 30.44)
    );
    kvRow('Duration', `${months} Month${months !== 1 ? 's' : ''}`);
  }
  kvRow('Lease Status', (data.status || 'active').replace(/_/g, ' ').toUpperCase());

  // ══════════════════════════════════════════════════════════════
  // 4. FINANCIAL TERMS
  // ══════════════════════════════════════════════════════════════
  sectionHeading('4. Financial Terms');

  kvRow('Monthly Rent', fmtCurrency(data.monthlyRent));
  kvRow('Security Deposit', fmtCurrency(data.securityDeposit));
  kvRow('Payment Due Date', '1st of every calendar month');
  kvRow('Late Fee', 'Per building policy');
  if (data.hasParking && data.parkingFee) {
    kvRow('Monthly Parking Fee', fmtCurrency(data.parkingFee));
  }

  // ══════════════════════════════════════════════════════════════
  // 5. COVENANTS & RULES
  // ══════════════════════════════════════════════════════════════
  sectionHeading('5. Covenants & Building Rules');

  const covenants = data.covenants && data.covenants.length
    ? data.covenants
    : [
        'Quiet hours: 10:00 PM – 7:00 AM daily',
        'Trash disposal via floor chutes (7:00 AM – 10:00 PM)',
        'Guest registration required for stays exceeding 48 hours',
        'No unauthorized structural alterations or lock changes',
      ];

  covenants.forEach((c, i) => {
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#334155')
      .text(`${i + 1}.  ${c}`, doc.page.margins.left + 10, doc.y, {
        width: pageWidth - 20,
      });
    doc.moveDown(0.2);
  });

  // ══════════════════════════════════════════════════════════════
  // 6. EXTENSION HISTORY (if any)
  // ══════════════════════════════════════════════════════════════
  if (data.extensionRequests && data.extensionRequests.length > 0) {
    sectionHeading('6. Extension Request History');

    data.extensionRequests.forEach((ext, i) => {
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#0F172A')
        .text(`Request #${i + 1}`, doc.page.margins.left, doc.y);
      doc.moveDown(0.15);
      kvRow('  Term', `${ext.termMonths} Month(s)`);
      kvRow('  Proposed Start', fmtDate(ext.proposedStartDate));
      kvRow('  Proposed End', fmtDate(ext.proposedEndDate));
      kvRow('  Monthly Rent', fmtCurrency(ext.monthlyRent));
      kvRow('  Status', (ext.status || '—').toUpperCase());
      if (ext.tenantNotes) kvRow('  Tenant Notes', ext.tenantNotes);
      if (ext.landlordNotes) kvRow('  Landlord Notes', ext.landlordNotes);
      doc.moveDown(0.3);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // SIGNATURE BLOCK
  // ══════════════════════════════════════════════════════════════
  doc.moveDown(1.5);
  hr(doc.y);
  doc.moveDown(1);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#64748B')
    .text(
      'By signing below, both parties agree to the terms and conditions outlined in this Lease Agreement.',
      { align: 'center' }
    );
  doc.moveDown(1.5);

  // Landlord signature line
  const sigY = doc.y;
  doc
    .moveTo(doc.page.margins.left, sigY)
    .lineTo(doc.page.margins.left + (pageWidth / 2 - 30), sigY)
    .strokeColor('#94A3B8')
    .lineWidth(0.75)
    .stroke();

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#64748B')
    .text('Landlord Signature', doc.page.margins.left, sigY + 5, {
      width: pageWidth / 2 - 30,
    });
  doc.text(`Name: ${data.landlordName || '________________________'}`, doc.page.margins.left, sigY + 18);
  doc.text('Date: ________________________', doc.page.margins.left, sigY + 31);

  // Tenant signature line
  const tenantSigX = doc.page.margins.left + pageWidth / 2 + 10;
  doc
    .moveTo(tenantSigX, sigY)
    .lineTo(doc.page.width - doc.page.margins.right, sigY)
    .strokeColor('#94A3B8')
    .lineWidth(0.75)
    .stroke();

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#64748B')
    .text('Tenant Signature', tenantSigX, sigY + 5, {
      width: pageWidth / 2 - 30,
    });
  doc.text(`Name: ${data.tenantName || '________________________'}`, tenantSigX, sigY + 18);
  doc.text('Date: ________________________', tenantSigX, sigY + 31);

  // ── Footer ──
  doc.moveDown(3);
  doc
    .fontSize(7)
    .font('Helvetica')
    .fillColor('#CBD5E1')
    .text(
      'This document was digitally generated by the JPTL Property Management System. It constitutes a binding agreement between the parties listed above.',
      { align: 'center' }
    );

  doc.end();
}
