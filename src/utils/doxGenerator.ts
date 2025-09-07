// src/utils/docxGenerator.ts
import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  TextRun,
  BorderStyle,
  convertInchesToTwip,
  PageBreak,
  ShadingType,
  Footer,
  PageNumber,
  Header,
  SectionType,
  ExternalHyperlink,
  ImageRun,
  Media,
  Packer,
} from "docx";
import { saveAs } from "file-saver";

interface DOCXExportOptions {
  quote: any;
  projectInfo: any;
  isClientExport?: boolean;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  if (!amount || amount === 0) return "";
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format quantity
const formatQuantity = (quantity: any): string => {
  if (quantity === null || quantity === undefined || quantity === "") return "";
  const num = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return "";
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

// Helper function to extract materials from quote
const extractMaterialsFromQuote = (quote: any): any[] => {
  if (quote.materialSchedule) {
    return quote.materialSchedule;
  }
  if (quote.consolidatedMaterials) {
    return quote.consolidatedMaterials;
  }
  return [];
};

// Helper function to create company header
const createCompanyHeader = (projectInfo: any): Paragraph[] => {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: projectInfo.companyName || "Elaris Construction",
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    }),
    projectInfo.companyTagline
      ? new Paragraph({
          children: [
            new TextRun({
              text: projectInfo.companyTagline,
              size: 12,
              color: "666666",
            }),
          ],
          spacing: { after: 400 },
        })
      : new Paragraph({ text: "" }),
  ];
};

// Helper function to create project information section
const createProjectInfoSection = (projectInfo: any): Table => {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROJECT INFORMATION",
                  bold: true,
                }),
              ],
            }),
          ],
          columnSpan: 2,
          shading: { fill: "F9FAFB" },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Project Title:",
                  bold: true,
                }),
              ],
            }),
          ],
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: projectInfo.title,
                }),
              ],
            }),
          ],
          width: { size: 75, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Client:",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: projectInfo.clientName,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Location:",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: projectInfo.location,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Project Type:",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: projectInfo.projectType,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  // Add optional fields
  if (projectInfo.houseType) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "House Type:",
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: projectInfo.houseType,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  if (projectInfo.region) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Region:",
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: projectInfo.region,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  if (projectInfo.floors) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Floors:",
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: projectInfo.floors.toString(),
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  if (projectInfo.consultant) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Consultant:",
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: projectInfo.consultant,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  if (projectInfo.contractor) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Contractor:",
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: projectInfo.contractor,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Add date
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Date:",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: projectInfo.date,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    },
    rows,
  });
};

// Helper function to create section title
const createSectionTitle = (text: string): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: "FFFFFF",
        size: 24,
      }),
    ],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
    shading: { type: ShadingType.CLEAR, fill: "3B82F6" },
    spacing: { after: 200 },
  });
};

// Helper function to create BOQ table
const createBOQTable = (section: any): Table => {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "ITEM",
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: "1E40AF" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "DESCRIPTION",
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
            }),
          ],
          width: { size: 48, type: WidthType.PERCENTAGE },
          shading: { fill: "1E40AF" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "UNIT",
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: "1E40AF" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "QTY",
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: "1E40AF" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "RATE (KSh)",
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 11, type: WidthType.PERCENTAGE },
          shading: { fill: "1E40AF" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "AMOUNT (KSh)",
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 11, type: WidthType.PERCENTAGE },
          shading: { fill: "1E40AF" },
        }),
      ],
    }),
  ];

  section.items.forEach((item: any) => {
    if (item.isHeader) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "" })],
              columnSpan: 6,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.description,
                      bold: true,
                    }),
                  ],
                }),
              ],
              columnSpan: 6,
              shading: { fill: "F3F4F6" },
            }),
          ],
        })
      );
    } else {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.itemNo,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.description,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.unit,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: formatQuantity(item.quantity),
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: formatCurrency(item.rate),
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: formatCurrency(item.amount),
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          ],
        })
      );
    }
  });

  // Add section total
  const sectionTotal = section.items
    .filter((item: any) => !item.isHeader)
    .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "" })],
          columnSpan: 5,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `TOTAL FOR ${section.title.toUpperCase()}:`,
                  bold: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
          shading: { fill: "F3F4F6" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(sectionTotal),
                  bold: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              shading: { fill: "F3F4F6" },
            }),
          ],
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    },
    rows,
  });
};

// Helper function to create cost breakdown table
const createCostBreakdownTable = (
  quote: any,
  isClientExport: boolean
): Table => {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "COST CATEGORY",
                  bold: true,
                }),
              ],
            }),
          ],
          width: { size: 70, type: WidthType.PERCENTAGE },
          shading: { fill: "F3F4F6" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "AMOUNT (KSh)",
                  bold: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: "F3F4F6" },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Materials Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.materials_cost),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Labor Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.labor_cost),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Equipment Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.equipment_cost),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Transport Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.transport_costs),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Services Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.services_cost),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Subcontractors Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.subcontractors_cost),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Preliminaries Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.preliminaries_cost),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Additional Items Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.addons_cost),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Permit Cost",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.permit_cost),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "SUBTOTAL (Before Overhead & Contingency)",
                  bold: true,
                }),
              ],
            }),
          ],
          shading: { fill: "F3F4F6" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.subtotal),
                  bold: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              shading: { fill: "F3F4F6" },
            }),
          ],
        }),
      ],
    }),
  ];

  if (!isClientExport) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "INDIRECT COSTS",
                    bold: true,
                  }),
                ],
              }),
            ],
            shading: { fill: "F3F4F6" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "AMOUNT (KSh)",
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
            shading: { fill: "F3F4F6" },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Overhead (${
                      quote.percentages?.[0]?.overhead || 0
                    }%)`,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: formatCurrency(quote.overhead_amount),
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Contingency (${
                      quote.percentages?.[0]?.contingency || 0
                    }%)`,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: formatCurrency(quote.contingency_amount),
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PROFIT",
                    bold: true,
                  }),
                ],
              }),
            ],
            shading: { fill: "F3F4F6" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: formatCurrency(quote.profit_amount),
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
                shading: { fill: "F3F4F6" },
              }),
            ],
          }),
        ],
      })
    );
  }

  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "GRAND TOTAL",
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
            }),
          ],
          shading: { fill: "3B82F6" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(quote.total_amount),
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
              alignment: AlignmentType.RIGHT,
              shading: { fill: "3B82F6" },
            }),
          ],
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    },
    rows,
  });
};

// Helper function to create footer
const createFooter = (): Footer => {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            children: [
              "Page ",
              PageNumber.CURRENT,
              " of ",
              PageNumber.TOTAL_PAGES,
            ],
          }),
          new TextRun({
            text: "\t\t\t\t",
          }),
          new TextRun({
            text: "Generated by Elaris AI",
          }),
        ],
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        },
      }),
    ],
  });
};

export const generateQuoteDOCX = async ({
  quote,
  projectInfo,
  isClientExport = false,
}: DOCXExportOptions) => {
  const materials = extractMaterialsFromQuote(quote);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            size: 22,
            font: "Calibri",
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
        heading1: {
          run: {
            size: 28,
            bold: true,
            color: "FFFFFF",
          },
          paragraph: {
            shading: { fill: "3B82F6" },
            spacing: { before: 400, after: 200 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: createCompanyHeader(projectInfo),
          }),
        },
        footers: {
          default: createFooter(),
        },
        children: [
          // Title Page
          new Paragraph({
            children: [
              new TextRun({
                text: "BILL OF QUANTITIES",
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "FOR",
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: projectInfo.title || "PROJECT",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "FOR",
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: projectInfo.clientName || "CLIENT",
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `(${projectInfo.location || "LOCATION"})`,
                bold: true,
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Project Information
          createProjectInfoSection(projectInfo),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // Cost Breakdown Summary
          createSectionTitle("COST BREAKDOWN SUMMARY"),
          createCostBreakdownTable(quote, isClientExport),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // Summary Notes
          new Paragraph({
            children: [
              new TextRun({
                text: "SUMMARY NOTES:",
                bold: true,
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• All amounts are in Kenyan Shillings (KES)",
              }),
            ],
            spacing: { after: 100 },
          }),
          ...(!isClientExport
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• Includes ${
                        quote.percentages?.[0]?.profit || 0
                      }% profit margin`,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• Includes ${
                        quote.percentages?.[0]?.contingency || 0
                      }% contingency`,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Valid for 30 days from ${
                  projectInfo.date || "date of issue"
                }`,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Made using Elaris AI",
                bold: true,
              }),
            ],
            spacing: { after: 400 },
          }),
        ],
      },
    ],
  });

  // Save the document
  const blob = await Packer.toBlob(doc);
  const fileName = `${
    isClientExport ? "Client" : "Contractor"
  }_Quote_${quote.title.replace(/\s+/g, "_")}.docx`;
  saveAs(blob, fileName);
};
