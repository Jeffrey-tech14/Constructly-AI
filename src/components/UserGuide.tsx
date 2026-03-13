// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronRight,
  FileUp,
  Settings,
  Calculator,
  BarChart3,
  Download,
  HelpCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  CreditCard,
  FileText,
  Heart,
} from "lucide-react";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  content: React.ReactNode;
  duration?: string;
}

const UserGuide = () => {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const guideSections: GuideSection[] = [
    {
      id: "overview",
      title: "Getting Started",
      icon: <HelpCircle className="w-5 h-5" />,
      description: "Understand the basics of creating a construction quote",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg  text-blue-900 dark:text-blue-100 mb-4">
              How JTech Works
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              JTech AI helps construction professionals quickly create accurate
              cost estimates by analyzing your floor plans and calculating
              material and labor requirements.
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              The system asks you for basic project information, then
              automatically calculates quantities and costs based on
              industry-standard methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Step 1: Configure Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set your project details, material prices, labor rates, and
                  other preferences specific to your location and standards.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-green-600" />
                  Step 2: Upload Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload your architectural floor plan (PDF or image). Our AI
                  will analyze it to extract dimensions and room information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  Step 3: Run Calculations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The system calculates all quantities (bricks, concrete, paint,
                  etc.) and their costs based on your specifications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="w-5 h-5 text-orange-600" />
                  Step 4: Export Quote
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate a professional PDF quote or Excel spreadsheet that
                  you can send to clients or use for purchasing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "plan-upload",
      title: "Uploading Your Plan",
      icon: <FileUp className="w-5 h-5" />,
      description: "How to upload and analyze your architectural floor plan",
      duration: "5-10 minutes",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preparing Your Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className=" text-gray-900 dark:text-white mb-2">
                  What to Upload
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Floor Plan:</strong> Clear architectural or
                      technical drawing showing room layouts and dimensions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>File Format:</strong> PDF, JPG, PNG, or WebP (max
                      20MB)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Quality:</strong> Clear, legible drawing with
                      visible dimensions and room labels
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className=" text-gray-900 dark:text-white mb-2">
                  What the AI Extracts
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Wall perimeters (external and internal)</li>
                  <li>• Plan details and layout</li>
                  <li>• Total building area</li>
                  <li>• Wall heights and floor levels</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">The Analysis Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="">Upload Your File</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select your floor plan file from your computer
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="">AI Analyzes the Plan</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our AI studies the drawing and extracts key measurements
                      and information (takes 30-60 seconds)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="">Review & Confirm</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Check the extracted data. You can edit any values that
                      don't look right
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="">Proceed to Quote Builder</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Move on to configure your project settings and generate
                      the quote
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                💡 Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <p>
                <strong>Clear is Better:</strong> The clearer your floor plan,
                the more accurate the AI analysis will be
              </p>
              <p>
                <strong>Edit Freely:</strong> Don't worry if the AI gets
                something slightly wrong - you can edit all extracted values
              </p>
              <p>
                <strong>Attached Drawings:</strong> Include Bar Bending Schedule
                or other supported structural details if available
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "quote-sections",
      title: "Quote Sections Explained",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "Understanding each part of your quote",
      duration: "10 minutes",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            A complete quote is broken down into different sections, each
            covering a specific aspect of the construction project:
          </p>

          <div className="space-y-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30">
                <CardTitle className="text-base">
                  Preliminaries & Site Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Temporary works needed before construction starts:
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Site clearance by area (calculated per m²)</li>
                  <li>• Project identification signage</li>
                  <li>• Site boundary hoarding/fencing</li>
                  <li>• Safety nets for site protection</li>
                  <li>• Fall prevention barriers (high-rise only)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/30">
                <CardTitle className="text-base">
                  Earthworks & Excavation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Digging and preparing the ground:
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Excavation volume and labor</li>
                  <li>• Backfill and compaction</li>
                  <li>• Site leveling and grading</li>
                  <li>• Dewatering (if needed)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-transparent dark:from-cyan-950/30">
                <CardTitle className="text-base">
                  Concrete & Reinforcement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Foundation and structural concrete:
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Concrete mix calculations (m³)</li>
                  <li>• Formwork (wooden framework)</li>
                  <li>• Reinforcing steel (rebar) quantities</li>
                  <li>• Labor for placement and finishing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-red-100 to-transparent dark:from-red-950/30">
                <CardTitle className="text-base">Walling & Masonry</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Building the walls:
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Concrete blocks or bricks</li>
                  <li>• Cement mortar for joints</li>
                  <li>• Plastering (internal and external)</li>
                  <li>• Labor for wall construction</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/30">
                <CardTitle className="text-base">Finishes</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Final surface treatments:
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Painting (walls and ceilings)</li>
                  <li>• Roofing materials and labor</li>
                  <li>• Ceiling treatments</li>
                  <li>• Floor finishes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
                <CardTitle className="text-base">MEP Systems</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Mechanical, Electrical & Plumbing:
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Electrical wiring and fixtures</li>
                  <li>• Water supply piping and fittings</li>
                  <li>• Drainage and sanitary systems</li>
                  <li>• HVAC (if applicable)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "step-by-step",
      title: "Step-by-Step Calculator Guide",
      icon: <Calculator className="w-5 h-5" />,
      description: "Detailed input/output guide for each calculator component",
      duration: "15 minutes",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How to Use Each Calculator
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              Each calculator section requires specific inputs and automatically
              calculates quantities and costs. Follow the order below for the
              most accurate results.
            </p>
          </div>

          <Tabs defaultValue="project" className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-2 h-auto flex-wrap">
              <TabsTrigger value="project" className="text-xs">
                Project Details
              </TabsTrigger>
              <TabsTrigger value="qs-settings" className="text-xs">
                QS Settings
              </TabsTrigger>
              <TabsTrigger value="earthworks" className="text-xs">
                Earthworks
              </TabsTrigger>
              <TabsTrigger value="concrete" className="text-xs">
                Concrete
              </TabsTrigger>
              <TabsTrigger value="masonry" className="text-xs">
                Masonry
              </TabsTrigger>
              <TabsTrigger value="flooring" className="text-xs">
                Flooring
              </TabsTrigger>
              <TabsTrigger value="mep" className="text-xs">
                MEP Systems
              </TabsTrigger>
              <TabsTrigger value="finishes" className="text-xs">
                Finishes
              </TabsTrigger>
              <TabsTrigger value="kitchen" className="text-xs">
                Kitchen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="project" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-blue-600">1.</span> Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Required Inputs:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Project Name</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          e.g., "Nairobi Residential 2BR"
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Client Name</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          e.g., "John Mwangi"
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Location/Region</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Affects regional price multipliers - Choose accurately
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Project ID for tracking
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Regional pricing multipliers applied
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qs-settings" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-green-600">2.</span> QS Settings
                    (Quantity Surveyor Configuration)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Financial Settings Section */}
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Financial Settings (Required):
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Labor Cost %</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Percentage or fixed amount for labor costs
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Overhead %</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Percentage or fixed amount for overhead expenses
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Profit Margin %</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Your desired profit percentage or fixed amount
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Contingency %</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Buffer for unforeseen costs (typical: 5-10%)
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Permit Cost</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Fixed or percentage-based licensing and permit fees
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Wastage Settings Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Material Wastage Percentages:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded border-l-4 border-purple-500">
                        <p className="font-medium">Concrete Wastage:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          5% (typ.)
                        </p>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded border-l-4 border-purple-500">
                        <p className="font-medium">Reinforcement Wastage:</p>
                        <p className="text-gray-600 dark:text-gray-400">4%</p>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded border-l-4 border-purple-500">
                        <p className="font-medium">Masonry Wastage:</p>
                        <p className="text-gray-600 dark:text-gray-400">3%</p>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded border-l-4 border-purple-500">
                        <p className="font-medium">Finishes Wastage:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          8% (flooring 10%, walls 8%, ceiling 10%)
                        </p>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded border-l-4 border-purple-500">
                        <p className="font-medium">Roofing Wastage:</p>
                        <p className="text-gray-600 dark:text-gray-400">7%</p>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded border-l-4 border-purple-500">
                        <p className="font-medium">MEP Wastage:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Electrical 2%, Plumbing 3%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional QS Elements Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Professional QS Elements (Toggle Options):
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Include Ring Beams</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Structural reinforcement at wall tops
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Include Lintels</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Over doors and windows
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Include Reinforcement</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Rebar in concrete and masonry
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">
                          Include DPC (Damp Proof Course)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Moisture barrier in foundations
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Include Scaffolding</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          With daily rates configured
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Include Movement Joints</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Expansion joint spacing (6m typical)
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Include Waste Removal</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          At configured rate per m³
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Concrete & Masonry Settings */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Concrete & Masonry Configuration:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Concrete Mix Ratio</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cement:Sand:Aggregate (typical: 1:2:4)
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Water-Cement Ratio</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          For concrete durability (typical: 0.5)
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Mortar Ratio</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cement:Sand for masonry joints (typical: 1:4)
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Plaster Ratio</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cement:Sand for plaster finish (typical: 1:4)
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Rebar Specifications</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Bar sizes (D8-D25), spacing, and lap lengths
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Applied To:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        All cost calculations across all sections
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Material quantity calculations with wastage
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Labor and overhead costing
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Final quote total with profit and contingency
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earthworks" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-orange-600">3.</span> Earthworks &
                    Site Prep
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Required Inputs:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Excavation Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Trenches / Full Excavation / Leveling
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Excavation Depth (meters)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Typical: 1.0-1.5m for foundations
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Fill Material (m³)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          If site needs leveling - leave blank if level
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Excavation volume (m³) & cost
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Fill material quantity & cost
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Labor days required
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="concrete" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-cyan-600">4.</span> Concrete Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Required Inputs:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                        <p className="font-medium">Concrete Grade</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          C20 (standard) / C25 / C30
                        </p>
                      </div>
                      <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                        <p className="font-medium">Foundation Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Strip / Raft / Pad - Most common: Strip
                        </p>
                      </div>
                      <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                        <p className="font-medium">Concrete Elements</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Slabs (floors), Beams, Columns, Strip Footings, Raft
                          Foundations
                        </p>
                      </div>
                      <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                        <p className="font-medium">Reinforcement</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Rebar sizing and spacing with overlap calculation
                        </p>
                      </div>
                      <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                        <p className="font-medium">
                          Advanced Features (Optional)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Waterproofing details, Septic tanks, Underground
                          storage tanks, Soak pits, Soakaways for drainage
                          solutions
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Concrete volume for each element (m³)
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Rebar quantity and weight (kg)
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Formwork requirements
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Total material costs
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Foundation specifications with dimensions
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="masonry" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-red-600">5.</span> Masonry & Walling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Building Dimensions (Required Inputs):
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">
                          External Wall Perimeter (meters)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Total length of exterior walls
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">
                          Internal Wall Perimeter (meters)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Total length of interior partition walls
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">Wall Height (meters)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Height per floor/level
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Masonry Material & Configuration (Required):
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">Wall Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Brick / Block / Stone - Most common: Block
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">Block Types</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Large (200×200mm), Standard (150×200mm), Small
                          (100×200mm), or Custom
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">Wall Thickness</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          230mm (single) / 450mm (cavity)
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">Mortar Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cement ratio: 1:3 / 1:4 / 1:6 - Standard is 1:4
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">Plaster Type (Optional)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          None / One Side / Both Sides applied
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-4 border-red-500">
                        <p className="font-medium">DPC & Hoop Iron</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Damp Proof Course and reinforcement requirements
                          calculated
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Number of bricks/blocks needed
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Mortar volume (m³)
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Total walling cost
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Labor days for construction
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roofing" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-amber-600">6.</span> Roofing System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Required Inputs:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                        <p className="font-medium">Roof Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Pitched / Flat / Hip
                        </p>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                        <p className="font-medium">Roofing Material</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Concrete tiles / Metal sheets / Asphalt shingles
                        </p>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                        <p className="font-medium">Guttering Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          PVC / Aluminum - Size: 90mm or 120mm
                        </p>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                        <p className="font-medium">
                          Roof Pitch (for pitched roofs)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Angle in degrees - Typical: 30-40°
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Roof coverage area (m²)
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Roofing material quantity with waste
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Guttering & downpipes length
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Total roofing system cost
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flooring" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-amber-600">6.5.</span> Flooring
                    Systems
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Required Inputs:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                        <p className="font-medium">Floor Material</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Ceramic Tiles, Granite Tiles, Granite, Hardwood Wooden
                          Panels, Cement Paste (Niro finish), PVC Vinyl
                          Flooring, Epoxy Flooring, Terrazzo, SPC Flooring
                        </p>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                        <p className="font-medium">Floor Area (m²)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Total floor area requiring finishing
                        </p>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                        <p className="font-medium">Skirting Board (Optional)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Automatically matched to floor material (Tile,
                          Hardwood, Stone, or PVC skirting). Not applicable for
                          Niro finishes
                        </p>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                        <p className="font-medium">Skirting Height</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Perimeter length of skirting board required,
                          calculated from room dimensions
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Floor material quantity (m²) with wastage
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Skirting board length & cost
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Underlayment and adhesive requirements
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Total flooring system cost with installation labor
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mep" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-purple-600">7.</span> MEP Systems
                    (Electrical, Plumbing)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Electrical Calculator
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                          <p className="font-medium">System Type</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Lighting, Power, Data, Security, CCTV, Fire Alarm,
                            Access Control, AV Systems, Emergency Lighting,
                            Renewable Energy
                          </p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                          <p className="font-medium">Cable Type</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            NYM-J, PVC/PVC, XLPE, MICC, SWA, Ethernet, Data
                            CAT6, Fiber Optic, Coaxial
                          </p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                          <p className="font-medium">Installation Method</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Surface, Concealed, Underground, Trunking
                          </p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                          <p className="font-medium">Outlet & Switch Types</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Power sockets, switches, dimmers, data ports, TV
                            points, USB chargers, circuit breakers
                          </p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                          <p className="font-medium">
                            Lighting Types & Wattage
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            LED downlights, fluorescent, halogen, emergency
                            lights, floodlights, street lights (3W-60W range)
                          </p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                          <p className="font-medium">
                            Voltage & Circuit Ratings
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Single 230V / Three Phase 400V with circuit breaker
                            ratings 6A-63A
                          </p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                          <p className="font-medium">Cable Sizes</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            1.0mm² to 150mm² for various applications and load
                            demands
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
                        Plumbing Calculator
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                          <p className="font-medium">System Type</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Water Supply, Drainage, Sewage, Rainwater, Hot
                            Water, Fire Fighting, Gas Piping, Irrigation
                          </p>
                        </div>
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                          <p className="font-medium">Pipe Material</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            PVC-U, PVC-C, Copper, PEX, Galvanized Steel, HDPE,
                            PPR, Cast Iron, Vitrified Clay
                          </p>
                        </div>
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                          <p className="font-medium">Pipe Diameters</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            15mm to 200mm range for different applications and
                            flow rates
                          </p>
                        </div>
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                          <p className="font-medium">Fixture Types</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Water closets, urinals, lavatories, kitchen sinks,
                            showers, bathtubs, bidets, floor drains, hose bibs
                          </p>
                        </div>
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded border-l-4 border-cyan-500">
                          <p className="font-medium">Quality Levels</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Standard, Premium, Luxury (for material and fitting
                            selection)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Cable lengths & circuit schedules (Electrical)
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Pipe lengths & fixture schedules (Plumbing)
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Material costs with labor
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        System capacity & specifications
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="finishes" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-yellow-600">8.</span> Internal &
                    External Wall Finishes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Internal Finishes Section */}
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Internal Wall Finishes (Required Inputs):
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border-l-4 border-yellow-500">
                        <p className="font-medium">Material Selection</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Stone Cladding, Tile Cladding, Wood Paneling, Smooth
                          Stucco, Gypsum Board, or Fluted Panels
                        </p>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border-l-4 border-yellow-500">
                        <p className="font-medium">Area Coverage (m²)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          How much wall area needs the finish
                        </p>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border-l-4 border-yellow-500">
                        <p className="font-medium">
                          Paint (Checkbox - Optional)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Enable multi-layer painting: skimming, undercoat,
                          finishing coat
                        </p>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border-l-4 border-yellow-500">
                        <p className="font-medium">
                          Wet Area Tiling (If Applicable)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Tile size selection (150x150mm to 1200x600mm),
                          adhesive, grout calculations
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* External Finishes Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      External Wall Finishes (Required Inputs):
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Material Type</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cladding, Marble, Limestone, Marzella, or Wall Master
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Plaster Finish</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Standard 25mm plaster thickness with cement/sand
                          requirements
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Wall Pointing (Checkbox)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Optional 5mm mortar jointing with cement/sand
                          calculations
                        </p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                        <p className="font-medium">Paint (Checkbox)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Multi-layer exterior painting with coverage
                          calculations
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ceiling Finishes Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Ceiling Finishes (Required Inputs):
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Ceiling Material</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Gypsum Board, PVC, Acoustic Tiles, Exposed Concrete,
                          Suspended Grid, or Wood Panels
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Ceiling Area (m²)</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Total floor/ceiling area requiring treatment
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Supplementary Materials</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Metal channels, studs, screws, corner tape, fiber
                          mesh, cornice, filler
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                        <p className="font-medium">Paint Finish</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Ceiling paint with coverage calculations
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Material quantities with wastage
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Paint coverage and layers needed
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Tile, adhesive, and grout quantities
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Plaster and pointing material calculations
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Total material costs
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kitchen" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-green-600">9.</span> Kitchen &
                    Wardrobes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Required Inputs:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Cabinet Specification</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Detailed items (cupboards, drawers, doors) with unit
                          pricing or lump-sum quote
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Countertop Material</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Granite / Tiles / Laminate / Engineered stone
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Countertop Granite Sizes</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Predefined: 1200×600, 1500×600 (default), 2000×600,
                          2400×600, 3000×600 mm
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                        <p className="font-medium">Number of Units</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Upper & Lower cabinets separately
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-3">
                      Results Generated:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Cabinet schedule with dimensions
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Countertop area & cost (auto-filled prices)
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Hardware requirements list
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{" "}
                        Total kitchen cost with installation
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 mt-6">
            <CardHeader>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                💡 General Tips for All Calculators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p>
                <strong>Follow Order:</strong> Work through sections in sequence
                - earlier sections feed into later ones
              </p>
              <p>
                <strong>Review Calculations:</strong> Each result is shown
                immediately so you can verify accuracy
              </p>
              <p>
                <strong>Prices Auto-Fill:</strong> Material prices are
                automatically populated from your pricing variables
              </p>
              <p>
                <strong>Make Adjustments:</strong> Edit any value anytime and
                calculations update immediately
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "variables",
      title: "Variables & Pricing",
      icon: <Settings className="w-5 h-5" />,
      description: "Configuring your pricing variables and rates",
      duration: "10 minutes",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg  text-blue-900 dark:text-blue-100 mb-3">
              What Are Variables?
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              Variables are all the pricing parameters that affect your quote
              calculations - materials, labor rates, equipment costs, and
              regional adjustments. By customizing these, you ensure your quotes
              accurately reflect your actual costs and pricing.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Main Variable Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">
                    Material Prices
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Unit prices for bricks, cement, paint, timber, etc. You can
                    override base prices with your regional rates or custom
                    suppliers.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">
                    Equipment Rates
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Daily or hourly rental rates for equipment like excavators,
                    cranes, compressors. Set based on your suppliers and
                    regional availability.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">
                    Transport Rates
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Cost per kilometer and base costs for different regions. The
                    system uses these to calculate delivery costs automatically.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">Services</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Subcontractor services, labor specializations, and other
                    services you charge for or subcontract.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">
                    Custom Materials & Equipment
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Add your own materials or equipment not in the base system.
                    Perfect for specialized suppliers or unique products.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                How to Access Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Go to Settings
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click your profile icon in the top right and select
                      "Settings"
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Find Variables & Pricing
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Look for the "Variables & Pricing" section or tab
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Choose a Category
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select from Materials, Equipment, Transport, Services
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Edit Prices
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click on any item to edit the price, or click "Add" to
                      create custom items
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Save Changes
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Changes are saved automatically. They apply to all future
                      quotes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Adding Custom Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                If you use materials not in the base system, add them as custom
                materials:
              </p>
              <div className="space-y-2 text-sm bg-blue-50 dark:bg-blue-950/20 p-4 rounded">
                <p className=" text-gray-900 dark:text-white">
                  Information Needed:
                </p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Material name (e.g., "Italian Marble Tile")</li>
                  <li>• Price per unit (KES)</li>
                  <li>• Unit of measurement (sq m, kg, liter, etc.)</li>
                  <li>• Category (optional - for organization)</li>
                  <li>• Description (optional - for notes)</li>
                </ul>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                You can add materials one by one or upload multiple materials at
                once using JSON format.
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                💡 Variables Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p>
                <strong>Update Regularly:</strong> Check and update prices
                quarterly to match market rates
              </p>
              <p>
                <strong>Be Specific:</strong> Use your actual supplier prices,
                not averages
              </p>
              <p>
                <strong>Regional Accuracy:</strong> Set different rates for
                different regions if you operate in multiple areas
              </p>
              <p>
                <strong>Test Changes:</strong> After updating variables, create
                a test quote to verify calculations
              </p>
              <p>
                <strong>Keep Records:</strong> Note when you made changes for
                reference
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "export",
      title: "Generating & Exporting",
      icon: <Download className="w-5 h-5" />,
      description: "Creating your final quote document",
      duration: "5 minutes",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">PDF Quote</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      Professional formatted quote document ready to send to
                      clients or suppliers.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Includes:</strong> Project details, itemized
                      costs, company branding, totals
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Excel Spreadsheet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      Detailed spreadsheet for further analysis, purchasing, and
                      budget planning.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Includes:</strong> All calculations, formulas,
                      sortable data, charts
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Before Exporting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="item1"
                    defaultChecked
                    disabled
                    className="mt-1"
                  />
                  <label
                    htmlFor="item1"
                    className="text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Review all quantities and prices in each section
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="item2"
                    defaultChecked
                    disabled
                    className="mt-1"
                  />
                  <label
                    htmlFor="item2"
                    className="text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Verify material prices match current market rates
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="item3"
                    defaultChecked
                    disabled
                    className="mt-1"
                  />
                  <label
                    htmlFor="item3"
                    className="text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Check that wastage percentages match your standards
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="item4"
                    defaultChecked
                    disabled
                    className="mt-1"
                  />
                  <label
                    htmlFor="item4"
                    className="text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Add any special notes or conditions to the quote
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                💡 Tips for Professional Quotes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p>
                <strong>Brand It:</strong> Add your company logo and contact
                details before sending
              </p>
              <p>
                <strong>Include Terms:</strong> Add payment terms, validity
                period, and delivery timeframes
              </p>
              <p>
                <strong>Professional Format:</strong> PDF looks more
                professional than Excel for client submissions
              </p>
              <p>
                <strong>Keep Records:</strong> Save copies of all quotes for
                your records and future reference
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "profile",
      title: "Your Profile",
      icon: <User className="w-5 h-5" />,
      description: "Managing your personal and company information",
      duration: "3 minutes",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            Your profile is where you store and manage all your personal and
            company information used across the platform.
          </p>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's in Your Profile?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className=" text-gray-900 dark:text-white">
                    Personal Information
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your name, email, phone number, and profile picture
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p className=" text-gray-900 dark:text-white">
                    Company Details
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Company name, registration number, address, and contact
                    information
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <p className=" text-gray-900 dark:text-white">
                    Professional Settings
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Logo, branding and company name
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Updating Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded space-y-2 text-sm">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Edit Anytime:</strong> Update any information in
                    your profile at any time
                  </p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Auto-Fill Quotes:</strong> Your company info
                    automatically appears on generated quotes
                  </p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Logo & Branding:</strong> Upload your company logo
                    which appears on all PDF exports
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                💡 Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p>
                <strong>Professional Image:</strong> Use a professional logo and
                clear contact information for credibility
              </p>
              <p>
                <strong>Update Regularly:</strong> Keep your material prices and
                rates current for accurate quotes
              </p>
              <p>
                <strong>Backup Information:</strong> A copy is saved in our
                databse for cross device usage
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "pdf-generation",
      title: "PDF Generation Process",
      icon: <FileText className="w-5 h-5" />,
      description:
        "How your quotes are converted to professional PDF documents",
      duration: "5 minutes",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg  text-blue-900 dark:text-blue-100 mb-3">
              What is a PDF Quote?
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              A PDF is a professional document format that looks exactly the
              same on every device. It's the industry standard for sending
              quotes to clients and is secure, reliable, and easy to share.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PDF Generation Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      You Click "Export to PDF"
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      System prepares all your quote data for formatting
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      System Formats the Data
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All quantities, prices, and calculations are formatted
                      into professional tables and sections
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Applies Your Branding
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your company logo, colors, and contact details are added
                      to the document
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Generates PDF File
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Professional PDF document is created and ready to download
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Ready to Share
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download or send directly to clients via email
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                What's Included in the PDF?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Project Information
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Project name, location, client details
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Itemized Costs
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Every material item with quantities and prices
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Section Totals
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Subtotals for each trade (painting, concrete, etc.)
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Grand Total
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Final project cost with taxes and fees
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Company Details
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your logo, name, contact info, registration
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Terms & Notes
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Payment terms, validity dates, special conditions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                💡 PDF Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p>
                <strong>Page Numbers:</strong> PDFs automatically include page
                numbers for multi-page quotes
              </p>
              <p>
                <strong>High Quality:</strong> PDFs look professional on screens
                and print clearly on paper
              </p>
              <p>
                <strong>File Size:</strong> PDFs are compressed and easy to
                email even with multiple pages
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "payments",
      title: "Quote Payments",
      icon: <CreditCard className="w-5 h-5" />,
      description: "How to pay for quote generation and unlock access",
      duration: "5 minutes",
      content: (
        <div className="space-y-6">
          <div className="border-2 border-green-500 dark:border-green-600 rounded-3xl p-6 bg-green-50 dark:bg-green-950/10">
            <h3 className="text-lg  text-green-900 dark:text-green-100 mb-3">
              Simple Per-Quote Pricing
            </h3>
            <p className="text-green-800 dark:text-green-200 mb-4">
              No subscriptions. No monthly fees. Just pay KES 1,000 for each
              quote you want to unlock.
            </p>
            <div className="text-4xl font-bold text-green-900 dark:text-green-100">
              KES 1,000
              <span className="text-xl ml-2 font-normal">
                per quote (one-time)
              </span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Create a Quote (Free)
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Build your quote and it's automatically saved as a draft.
                      No payment needed yet.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Click "Unlock Quote"
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      When ready to access full features, click the unlock
                      button and proceed to payment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Pay KES 1,000
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Securely pay via Paystack (card, M-Pesa, or bank
                      transfer).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <p className=" text-gray-900 dark:text-white">
                      Full Access Unlocked
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Access progress tracking, BOQ generation, editing, and
                      exports.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                What You Get After Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Progress Tracking:</strong> See the percentage
                    completion of your quote calculations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Bill of Quantities (BOQ):</strong> Generate detailed
                    BOQ in PDF, Excel, or Word format
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Edit Capabilities:</strong> Modify quote details and
                    recalculate as needed
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Material Schedules:</strong> Access detailed
                    material lists for ordering
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Download & Share:</strong> Export and send quotes to
                    clients or suppliers
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded space-y-3">
                <div>
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Payment Method
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Secured by Paystack - accepts cards, M-Pesa, bank transfers,
                    and more
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Payment Type
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    One-time, non-refundable payment per quote (not recurring)
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Invoice & Receipt
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatic receipt sent to your email after successful
                    payment
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className=" text-gray-900 dark:text-white mb-1">
                    Security
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All payments are encrypted and processed securely by
                    Paystack
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Understanding Your Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">
                    Quote Unlock Fee
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    KES 1,000 per quote (one-time payment)
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">
                    Payment Processing
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Paystack may charge a small fee (1-2%) depending on payment
                    method - shown before you pay
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">
                    No Hidden Charges
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total cost is transparent and displayed before you complete
                    payment
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className=" text-gray-900 dark:text-white">Save More</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Only pay for quotes you want to unlock - create draft quotes
                    for free
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                💡 Payment Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p>
                <strong>Create for Free:</strong> Build and save quotes as
                drafts without any payment
              </p>
              <p>
                <strong>Pay When Ready:</strong> Only unlock quotes you actually
                need to access
              </p>
              <p>
                <strong>Multiple Quotes:</strong> Each quote is independent -
                pay KES 1,000 per quote you unlock
              </p>
              <p>
                <strong>Keep Records:</strong> All your payment receipts are
                saved in your account
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-4">
            User Guide
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Learn how to create accurate construction quotes using JTech AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-16">
              <CardHeader>
                <CardTitle className="text-lg">Guide Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {guideSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span className="text-sm font-medium">
                          {section.title}
                        </span>
                      </div>
                      {section.duration && (
                        <p className="text-xs mt-1 opacity-75">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {section.duration}
                        </p>
                      )}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {guideSections.map((section) => (
              <div
                key={section.id}
                className={activeSection === section.id ? "block" : "hidden"}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                          {section.icon}
                        </div>
                        <div>
                          <CardTitle className="text-2xl">
                            {section.title}
                          </CardTitle>
                          <CardDescription className="text-base mt-1">
                            {section.description}
                          </CardDescription>
                        </div>
                      </div>
                      {section.duration && (
                        <Badge variant="outline" className="whitespace-nowrap">
                          <Clock className="w-3 h-3 mr-1" />
                          {section.duration}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="rounded-3xl shadow">
                    <div className="">{section.content}</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="text-xl  text-gray-900 dark:text-white mb-4">
                Ready to Create Your First Quote?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Follow the steps in this guide to build accurate construction
                estimates in minutes.
              </p>
              <a
                href="/quotes/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg  transition-colors"
              >
                Start Building a Quote
                <ChevronRight className="w-5 h-5" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
