"""
Generate 10 realistic synthetic industrial documents as text files.
These are saved as .txt files but can be converted to PDFs using fpdf2.

Run: python sample_data/generate_samples.py
"""

import os
from pathlib import Path

try:
    from fpdf import FPDF
    HAS_FPDF = True
except ImportError:
    HAS_FPDF = False
    print("fpdf2 not installed — saving as .txt files. Run: pip install fpdf2")

OUTPUT_DIR = Path(__file__).parent / "generated"
OUTPUT_DIR.mkdir(exist_ok=True)


DOCUMENTS = [
    # ── 1. Pump P-101 Maintenance Log ────────────────────────────────────────
    {
        "filename": "Pump_P101_Maintenance_Log_March2025.pdf",
        "content": """MAINTENANCE LOG — PUMP P-101
Facility: Refinery Unit 3 | Date: March 15, 2025
Prepared by: Engineer Rajesh Kumar | Approved by: Manager Sunil Verma

EQUIPMENT DETAILS
Equipment ID: Pump P-101
Type: Centrifugal Pump (API 610)
Location: Process Area 3, Bay 7
Manufacturer: Kirloskar Brothers Ltd.
Serial No: KBL-2019-P101-007
Last Maintenance: December 10, 2024

MAINTENANCE ACTIVITIES PERFORMED
1. Mechanical Seal Inspection
   - Removed and inspected mechanical seal assembly.
   - Found seal face worn beyond acceptable limits (wear: 2.3 mm; limit: 1.5 mm).
   - Replaced mechanical seal with OEM part (Part No: KBL-MS-P101-A).
   - Leak test performed — PASS.

2. Bearing Inspection and Replacement
   - Both drive-end and non-drive-end bearings inspected.
   - DE bearing showed signs of pitting (vibration reading: 8.2 mm/s; alarm limit: 7.1 mm/s).
   - Replaced DE bearing: SKF 6312-2RS1.
   - NDE bearing in acceptable condition — retained.

3. Impeller Clearance Adjustment
   - Front clearance measured: 0.45 mm (acceptable range: 0.30–0.50 mm).
   - No adjustment required.

4. Coupling Alignment
   - Laser alignment performed.
   - Angular misalignment corrected from 0.08 mm/100 mm to 0.01 mm/100 mm.
   - Parallel offset: 0.02 mm (acceptable).

REGULATORY COMPLIANCE
- Work performed in accordance with OISD-105 (Inspection of Rotating Equipment).
- Hot work permit obtained: HWP-2025-0315-003 (signed by Safety Officer Anita Singh).
- Lock-out/Tag-out procedure followed per FACTORY ACT SECTION 7B.

NEXT MAINTENANCE DUE
Scheduled: June 2025 (Q2 periodic inspection)
Critical items to monitor: NDE bearing vibration, seal leakage

POST-MAINTENANCE TEST RESULTS
Flow rate: 185 m³/hr (design: 180 m³/hr) ✓
Discharge pressure: 8.2 bar (design: 8.0 bar) ✓
Vibration (overall): 3.1 mm/s ✓
Temperature (bearing): 52°C ✓

Signatures:
Maintenance Engineer: Rajesh Kumar | Date: 15-Mar-2025
Safety Officer: Anita Singh | Date: 15-Mar-2025
Shift Manager: Sunil Verma | Date: 15-Mar-2025
""",
    },

    # ── 2. Compressor C-204 Maintenance Log ──────────────────────────────────
    {
        "filename": "Compressor_C204_Maintenance_Log_Q1_2025.pdf",
        "content": """MAINTENANCE LOG — COMPRESSOR C-204
Facility: Gas Processing Plant | Quarter: Q1 2025 (January–March)
Prepared by: Engineer Priya Mehta | Reviewed by: Manager Sunil Verma

EQUIPMENT DETAILS
Equipment ID: Compressor C-204
Type: Reciprocating Compressor (API 618)
Location: Compression Unit 2
Manufacturer: Dresser-Rand (Now Siemens Energy)
Serial No: DR-2017-C204-44A
Associated Vessel: Suction Drum V-301
Operating Pressure: 18 bar (suction) / 42 bar (discharge)

QUARTERLY INSPECTION FINDINGS
Inspection Date: January 22, 2025

Valve Condition:
- Suction valve (Cylinder 1): Worn plate; replaced.
- Discharge valve (Cylinder 1): Acceptable.
- Suction valve (Cylinder 2): Acceptable.
- Discharge valve (Cylinder 2): Minor deposit buildup — cleaned.

Piston Rod Inspection:
- Rod runout: 0.03 mm (limit: 0.05 mm) ✓
- Surface roughness: Ra 0.8 µm (acceptable) ✓

Lube Oil System:
- Oil pressure: 3.2 bar (design: 3.0–4.0 bar) ✓
- Oil temperature: 58°C (alarm: 75°C) ✓
- Oil sample sent for analysis: Report No. OIL-2025-Q1-C204
- Recommendation from oil analysis: Change oil at next PM (April 2025)

SAFETY OBSERVATIONS
- Area around C-204 found with minor gas leak at flange connection (Flange ID: FL-204-12).
- Gas leak detected using DRAGER X-AM 5600 detector.
- Immediate corrective action taken: Bolts re-torqued to 280 Nm.
- Incident logged as Near-Miss NM-2025-017.
- Reported to Safety Officer Anita Singh.

REGULATORY REFERENCES
- OISD-105: Clause 8.3 — Reciprocating Compressor Inspection
- FACTORY ACT, 1948: Section 21 — Fencing of Machinery
- API Standard 618: 5th Edition

ASSOCIATED EQUIPMENT STATUS
V-301 (Suction Drum): Inspected March 10, 2025 — No anomalies found.

NEXT ACTIONS
- Replace lube oil at April 2025 PM.
- Re-inspect FL-204-12 in 30 days.
- Schedule vibration analysis for Q2.

Signatures:
Maintenance Engineer: Priya Mehta | Date: 22-Jan-2025
Safety Officer: Anita Singh | Date: 22-Jan-2025
Operations Manager: Sunil Verma | Date: 23-Jan-2025
""",
    },

    # ── 3. Heat Exchanger HX-502 Maintenance Log ─────────────────────────────
    {
        "filename": "HeatExchanger_HX502_Maintenance_Log_2025.pdf",
        "content": """MAINTENANCE LOG — HEAT EXCHANGER HX-502
Facility: Refinery Unit 3 | Date: February 28, 2025
Performed by: Inspector Vikram Nair | Approved by: Sunil Verma

EQUIPMENT DETAILS
Equipment ID: Heat Exchanger HX-502
Type: Shell and Tube (TEMA Type BEM)
Location: Process Area 3 (adjacent to Pump P-101)
Service: Crude Oil Pre-heat (cold side) / Hot Condensate (shell side)
Manufacturer: Alfa Laval India
Design Pressure: Shell: 25 bar | Tube: 40 bar
Last Inspection: February 2024

INSPECTION SCOPE
Scheduled annual inspection per OISD-147 (Inspection of Pressure Vessels).

TUBE INSPECTION RESULTS
- Total tubes: 248
- Eddy current testing performed on 100% of tubes.
- Plugged tubes: 6 (from previous inspection)
- New tubes requiring plugging: 3 (tube IDs: T-048, T-112, T-187)
- Tubes with significant wall loss (>30%): 3 (plugged)
- Tubes with moderate wall loss (15–30%): 11 (monitoring)
- Total plugged tubes after this inspection: 9 (3.6% of total — within 10% limit)

SHELL SIDE INSPECTION
- Internal corrosion: Minor (0.2 mm measured vs design allowance of 3.0 mm)
- Baffle condition: Acceptable
- Nozzle inspection: All nozzles in good condition

GASKET REPLACEMENT
- All shell-side and channel-side flanges: Gaskets replaced with spiral wound gaskets.
- Material: SS 316 + flexible graphite filler.

HYDROSTATIC TEST
- Shell side: Tested at 37.5 bar for 30 minutes — No leaks detected ✓
- Tube side: Tested at 60 bar for 30 minutes — No leaks detected ✓

SAFETY REQUIREMENTS FOR RE-COMMISSIONING
- Confined Space Entry Permit required for final internal inspection.
- Permit No: CSE-2025-028 (issued by Safety Officer Anita Singh).
- Atmosphere monitoring confirmed: O₂ = 20.9%, LEL = 0%, H₂S = 0 ppm.

UTILITIES USED
- Nitrogen purging performed prior to entry.
- P-101 (cooling water pump) used to flush tube side.

NEXT INSPECTION
Due: February 2026 (annual) or when tube plugging reaches 10%.

Signed:
Inspector: Vikram Nair | Date: 28-Feb-2025
Safety Officer: Anita Singh | Date: 28-Feb-2025
Plant Manager: Sunil Verma | Date: 01-Mar-2025
""",
    },

    # ── 4. Hot Work Safety Procedure ─────────────────────────────────────────
    {
        "filename": "Hot_Work_Safety_Procedure_SOP-HSE-012.pdf",
        "content": """STANDARD OPERATING PROCEDURE
SOP No: SOP-HSE-012 | Revision: 4
Title: HOT WORK SAFETY PROCEDURE
Applicable Area: All Process Areas including Process Area 3
Issued by: HSE Department | Date: January 2025
Approved by: Plant Manager Sunil Verma

1. PURPOSE
This procedure defines requirements for controlling ignition sources during hot work
operations in accordance with OISD-105 (Fire Prevention and Protection System for
Static Equipment) and Factory Act, 1948, Sections 7A and 7B.

2. SCOPE
Applies to all hot work activities including:
- Welding (arc, gas, TIG, MIG)
- Grinding and cutting
- Use of open flames
- Heat guns and hot air blowers
Near any flammable/combustible materials, or within 15 meters of process equipment
including Pump P-101, Compressor C-204, Heat Exchanger HX-502, and Vessel V-301.

3. DEFINITIONS
Hot Work: Any work producing sparks, flames, or heat above 50°C in hazardous areas.
Hot Work Permit (HWP): Written authorization for hot work activities.
Isolating Authority: The person responsible for equipment isolation.

4. RESPONSIBILITIES
HSE Officer (Anita Singh): Issues hot work permits; conducts gas tests.
Shift Supervisor: Ensures conditions comply before signing permit.
Maintenance Engineer: Performs actual hot work; ensures equipment is isolated.
Fire Watch: Dedicated personnel to monitor for fires during and after hot work.

5. HOT WORK PERMIT PROCEDURE
Step 1: Request
  - Maintenance Engineer submits HWP request 24 hours in advance.
  - Include: equipment ID (e.g., P-101), location, nature of work, duration.

Step 2: Hazard Assessment
  - HSE Officer and Shift Supervisor conduct joint site inspection.
  - Identify all flammable materials within 15 m radius.
  - Check proximity to P-101, C-204, HX-502 — if within 10 m, additional approval required.

Step 3: Gas Testing
  - Continuous gas monitoring required using calibrated detector (DRAGER X-AM 5600).
  - Work may proceed only if: LEL < 10%, O₂ = 19.5–23%, H₂S < 5 ppm.
  - Re-test every 30 minutes during work.

Step 4: Isolation
  - Process equipment (e.g., P-101) must be isolated per LOTO procedure SOP-HSE-008.
  - Blind flanging of all connecting lines mandatory for vessel work.

Step 5: Permit Issue
  - Valid for maximum 8 hours; must be renewed for longer operations.
  - Three copies: HSE file, work site display, Maintenance.

6. EQUIPMENT REQUIREMENTS
- Fire extinguisher (dry powder, 9 kg minimum) at work site.
- Fire hose available and charged within 30 m.
- Spark-proof tools mandatory within 3 m of open hydrocarbon systems.
- Personal protective equipment: welding shield, gloves, FR coverall.

7. POST-WORK REQUIREMENTS
- All hot work areas inspected 30 minutes and 60 minutes after completion.
- Fire watch to remain for minimum 60 minutes post-completion.
- Permit closed and signed off by HSE Officer.

8. REGULATORY REFERENCES
- OISD-105: Clause 6 — Hot Work Permit System
- OISD-STD-105: Table 1 — Hazardous Area Classification
- Factory Act 1948: Section 7A — General Duties of Manufacturers
- Petroleum Rules 2002: Rule 31 — Handling of Petroleum Products

Document History:
Rev 1 (2020): Initial issue | Rev 2 (2021): Added C-204 area | Rev 3 (2022): Updated gas limits | Rev 4 (2025): Added HX-502 and V-301 proximity requirements
""",
    },

    # ── 5. Confined Space Entry Procedure ─────────────────────────────────────
    {
        "filename": "Confined_Space_Entry_Procedure_SOP-HSE-019.pdf",
        "content": """STANDARD OPERATING PROCEDURE
SOP No: SOP-HSE-019 | Revision: 2
Title: CONFINED SPACE ENTRY PROCEDURE
Issued by: HSE Department | Approved: Sunil Verma | Date: March 2024

1. PURPOSE
To establish minimum safety requirements for entry into confined spaces within the
facility, in compliance with OISD-GDN-192 and Factory Act 1948, Section 36.

2. DEFINITION OF CONFINED SPACE
A confined space is any enclosed or partially enclosed space that:
- Is not primarily designed for continuous human occupancy.
- Has restricted means for entry and exit.
- May have an internal atmosphere that is or may become hazardous.

Confined Spaces at this Facility (Representative List):
- Suction Drum V-301 (associated with Compressor C-204)
- Shell side of Heat Exchanger HX-502
- Storage Tank T-801
- Underground chambers in Pump House P-101 area

3. CLASSIFICATION
Class A (Immediately Dangerous to Life and Health — IDLH): V-301 (H₂S risk >10 ppm)
Class B (Potentially Hazardous): HX-502 shell side (oxygen deficiency risk)
Class C (Non-hazardous but requires permit): Underground chambers

4. CONFINED SPACE ENTRY PERMIT (CSEP)
- Mandatory for all Class A and Class B spaces.
- Issued by: HSE Officer Anita Singh only.
- Valid for: Maximum 8 hours per shift.
- Atmospheric Testing required before entry and every 30 minutes:
  O₂: 19.5%–23.0% | LEL: <10% | H₂S: <5 ppm | CO: <25 ppm

5. ENTRY TEAM REQUIREMENTS
Entrant: Minimum 1 person (trained in confined space hazards).
Attendant: Minimum 1 person stationed outside at all times.
Entry Supervisor: Rajesh Kumar or authorized engineer.
Rescue Team: On standby (minimum 2 persons with SCBA).

6. ISOLATION REQUIREMENTS
- Complete isolation of V-301 from Compressor C-204 using blind flanges.
- Lockout of all energy sources (electrical, pneumatic, hydraulic).
- Lockout applied per SOP-HSE-008 (LOTO procedure).
- Depressurize and purge with nitrogen before entry.

7. EQUIPMENT REQUIRED
- 4-gas detector (O₂, LEL, H₂S, CO): DRAGER X-AM 5600.
- Self-contained breathing apparatus (SCBA) on standby.
- Rescue harness and tripod for V-301 entry.
- Explosion-proof lighting.
- Intrinsically safe communication device.

8. EMERGENCY PROCEDURE
In case of entrant distress:
1. Attendant raises alarm immediately — DO NOT ENTER to rescue without SCBA.
2. Call Plant Emergency: Extension 500.
3. Rescue team deploys within 4 minutes.
4. First aid administered by trained paramedic (Mohan Das, Medical Room).

9. POST-ENTRY
- Permit closed by Entry Supervisor.
- All equipment accounted for before closing confined space.
- Debrief conducted if any abnormal conditions encountered.

REFERENCES
- OISD-GDN-192: Confined Space Entry Guidelines
- Factory Act 1948: Section 36 — Confined Spaces
- IS:15001:2016 — Safety in Confined Spaces
""",
    },

    # ── 6. OISD-105 Regulatory Excerpt ────────────────────────────────────────
    {
        "filename": "OISD_105_Regulatory_Excerpt.pdf",
        "content": """OISD STANDARD — OISD-105
FIRE PREVENTION AND PROTECTION SYSTEM FOR STATIC EQUIPMENT
(Excerpt — Key Clauses)

Oil Industry Safety Directorate (OISD)
Ministry of Petroleum and Natural Gas, Government of India
Edition: 4th (Revised) | Year: 2020

FOREWORD
OISD-105 provides mandatory guidelines for fire prevention, detection, and suppression
systems in oil and gas processing facilities. Compliance is required for all refineries,
gas processing plants, and petrochemical complexes operating in India under the Petroleum
Act, 1934.

CLAUSE 4: GENERAL REQUIREMENTS
4.1 Fire and gas detection systems shall be installed in all process areas where
    flammable materials are handled, including areas containing:
    - Rotating equipment (pumps, compressors): e.g., Pump P-101, Compressor C-204
    - Heat exchangers handling flammable process fluids: e.g., HX-502
    - Pressure vessels and drums: e.g., V-301

4.2 Hydrocarbon detectors shall be calibrated every 6 months and after any incident.

4.3 Fixed water spray systems shall protect:
    (a) All pumps with combined motor rating exceeding 75 kW.
    (b) All reciprocating and centrifugal compressors.

CLAUSE 6: HOT WORK PERMIT SYSTEM
6.1 Written Hot Work Permit required for all ignition sources in classified areas.
6.2 Gas testing mandatory before and during hot work (see Table 6.1).
6.3 Hot work within 15 m of open hydrocarbon systems requires Plant Manager approval.
6.4 Hot Work Permits shall not be valid for more than 8 hours without renewal.
6.5 All permits shall be retained for 5 years as records.

TABLE 6.1 — PERMISSIBLE ATMOSPHERIC CONDITIONS FOR HOT WORK
| Parameter | Permissible Limit | Action if Exceeded |
|-----------|------------------|--------------------|
| LEL       | < 10%            | Stop work immediately |
| O₂        | 19.5–23.0%       | Stop work immediately |
| H₂S       | < 5 ppm          | Evacuate area |
| SO₂       | < 2 ppm          | Stop work, increase ventilation |

CLAUSE 8: INSPECTION OF ROTATING EQUIPMENT
8.1 All centrifugal pumps (e.g., P-101) shall be inspected at intervals not exceeding
    6 months for mechanical seal condition, bearing vibration, and alignment.
8.2 Vibration limits for centrifugal pumps: alarm at 7.1 mm/s, shutdown at 11.2 mm/s.
8.3 Reciprocating compressors (e.g., C-204) shall undergo valve inspection every quarter.
8.4 Infrared thermography shall be performed annually on all rotating equipment.

CLAUSE 12: PRESSURE VESSEL INSPECTION
12.1 All pressure vessels (e.g., V-301, HX-502 shell) shall be inspected per OISD-147.
12.2 Minimum inspection frequency: External every year; Internal every 5 years or per
     remaining life assessment.
12.3 Hydrostatic testing required after any repair or after maximum inspection interval.

CLAUSE 15: FIRE FIGHTING SYSTEM
15.1 Fire water ring main shall maintain a minimum residual pressure of 7 bar.
15.2 Fire water pump capacity shall supply the highest demand scenario for 4 hours.
15.3 Fire extinguishers shall be inspected every 6 months; replaced as per manufacturer.

PENALTIES FOR NON-COMPLIANCE
Non-compliance with OISD-105 may result in:
- Show cause notice from Petroleum and Explosives Safety Organisation (PESO).
- Suspension of operating license.
- Prosecution under Petroleum Act, 1934.

ASSOCIATED STANDARDS
- OISD-STD-116: Fire Fighting Equipment and Inspection
- OISD-STD-147: Inspection of Pressure Vessels
- OISD-GDN-192: Confined Space Entry
- API 610: Centrifugal Pumps for Petroleum
- API 618: Reciprocating Compressors for Petroleum
""",
    },

    # ── 7. Factory Act Safety Standards Excerpt ───────────────────────────────
    {
        "filename": "Factory_Act_Safety_Standards_Excerpt.pdf",
        "content": """THE FACTORIES ACT, 1948
(Selected Safety-Relevant Provisions)

Government of India — Ministry of Labour and Employment
As amended up to 2023

CHAPTER IV — SAFETY

SECTION 21 — FENCING OF MACHINERY
(1) In every factory the following shall be securely fenced by safeguards of substantial
    construction which shall be constantly maintained and kept in position while the parts
    of machinery they are fencing are in motion or in use:
    (a) Every moving part of a prime mover and every flywheel connected to a prime mover;
    (b) The headrace and tailrace of every water wheel and water turbine;
    (c) Any part of a stock-bar which projects beyond the head-stock of a lathe;
    (d) Unless they are in such position or of such construction as to be safe to every
        person employed in the factory as it would be if they were securely fenced —
        every part of an electric generator, a motor or rotary converter; every part of
        transmission machinery; and every dangerous part of any other machinery.

SECTION 28 — HOISTS AND LIFTS
All hoists and lifts shall be tested and examined at least once in every period of
6 months by a competent person.

SECTION 29 — LIFTING MACHINES, CHAINS, ROPES AND LIFTING TACKLE
Every lifting machine and every chain, rope or lifting tackle shall be of good
construction, sound material and adequate strength. Shall be examined by a competent
person at least once in every 12 months.

SECTION 36 — CONFINED SPACES (as amended 2016)
(1) No person shall be required to enter or work in any confined space (including
    vessels, vats, tanks, pits, flues, and pipes) in which dangerous fumes are likely
    to be present until:
    (a) The space has been adequately purged of all dangerous fumes;
    (b) A certificate has been issued by the competent person;
    (c) A suitable breathing apparatus and a belt or rope for emergency rescue
        is readily available.
(2) The Inspector may exempt any factory from this provision where the nature of
    the work makes compliance impracticable.

SECTION 7A — GENERAL DUTIES OF OCCUPIERS
The occupier of every factory shall ensure, so far as is reasonably practicable:
(a) The provision and maintenance of plant and systems of work that are safe.
(b) Arrangements for ensuring safety and absence of health risks in connection with
    the use, handling, storage and transport of articles and substances.
(c) The provision of such information, instruction, training and supervision as is
    necessary to ensure the health and safety of all workers.
(d) The maintenance of all workplaces under the occupier's control in a condition
    that is safe and without health risks, including the means of access and egress.
(e) The provision and maintenance of a working environment that is safe, without
    health risks and adequate with regard to facilities for the welfare of workers.

SECTION 7B — GENERAL DUTIES OF MANUFACTURERS
Any person who designs, manufactures, imports, or supplies any article for use in
any factory shall ensure that the article is so designed and constructed as to be safe
and without risk to the health of the workers when properly used.

SECTION 87 — DANGEROUS OPERATIONS
The State Government may make rules requiring that operations declared to be dangerous
shall only be carried out under specified conditions. Applicable dangerous operations
include welding, cutting, and hot work in petroleum processing plants.

SCHEDULE TO CHAPTER IV (Notifiable Diseases in Factories)
Includes: Hydrogen Sulphide (H₂S) poisoning — reportable disease.

PENALTIES
Sections 92–96: Any person contravening the provisions of this Act is liable to:
- First offence: Imprisonment up to 2 years OR fine up to Rs. 1,00,000 OR both.
- Subsequent offence: Imprisonment up to 3 years OR fine up to Rs. 2,00,000 OR both.
""",
    },

    # ── 8. Near-Miss Incident Report (Pump Seal Failure) ─────────────────────
    {
        "filename": "Near_Miss_Report_NM2025017_Pump_Seal.pdf",
        "content": """NEAR-MISS INCIDENT REPORT
Report No: NM-2025-017
Classification: Near-Miss (High Potential)
Date of Incident: January 22, 2025 | Time: 14:35
Location: Process Area 3, Bay 7 — Pump P-101
Reported by: Engineer Priya Mehta | Safety Officer: Anita Singh

INCIDENT DESCRIPTION
During routine patrol inspection of the process area, Engineer Priya Mehta observed a
hydrocarbon liquid dripping from the area of Pump P-101 mechanical seal at a rate of
approximately 3-4 drops per minute. The leak was from the mechanical seal gland area.

The pump was operating under normal conditions:
- Flow: 183 m³/hr
- Discharge pressure: 8.1 bar
- Product: Crude oil (flash point: 32°C)

Immediate action taken by Priya Mehta:
1. Alerted Control Room Operator (Ramesh Pillai) via radio.
2. Shut down P-101 using local stop push button at 14:38.
3. Contacted HSE Officer Anita Singh.
4. Erected temporary bund and placed absorbent pads.

Backup pump P-102 was started by Control Room at 14:41 — no process disruption.

POTENTIAL CONSEQUENCE
Had the seal failure progressed unchecked or been exposed to an ignition source (hot
work was scheduled in Bay 7 the following day per HWP-2025-0122-001), the scenario
could have escalated to a fire or flash fire. Estimated hydrocarbon inventory: 45 liters
in immediate area. Severity classification: CRITICAL.

HOT WORK PERMIT CANCELLATION
Hot work permit HWP-2025-0122-001 (scheduled for January 23, Bay 7) was immediately
cancelled by HSE Officer Anita Singh upon being notified of the incident.

ROOT CAUSE ANALYSIS
Immediate Cause: Mechanical seal face worn beyond acceptable limits.
Root Cause: Mechanical seal replacement was not performed at the December 2024 PM
because spare parts (Part No: KBL-MS-P101-A) were not in stock. The PM task was
deferred without proper risk assessment.
Contributing Factor: Spare parts inventory management gap — critical spares not tracked
against equipment criticality.

CORRECTIVE ACTIONS
1. Immediate: Replace mechanical seal (completed March 15, 2025 — see Maintenance Log).
2. Short-term (30 days): Review critical spare parts list for P-101, C-204, HX-502.
3. Long-term (90 days): Implement spare parts management system linked to PM schedule.
4. Training: Refresh training for Maintenance Engineers on deferred PM risk assessment.

REGULATORY REPORTING
- Reported to Factory Inspector as per Factory Act Section 88 (Major Accident).
- OISD notification submitted: OISDNotif-2025-017.
- Insurance carrier notified: Policy No. INS-REF-2019-0045.

LESSONS LEARNED
1. Never defer mechanical seal replacement on P-101 without HSE Officer approval.
2. Adjacent hot work permits must be reviewed whenever equipment leaks are reported.
3. Criticality-based spare parts management is essential for equipment like P-101.

Signatures:
Reporting Engineer: Priya Mehta | Date: 22-Jan-2025
HSE Officer: Anita Singh | Date: 22-Jan-2025
Plant Manager: Sunil Verma | Date: 23-Jan-2025
Investigation Team Lead: Rajesh Kumar | Date: 25-Jan-2025
""",
    },

    # ── 9. Incident Report (Compressor Shutdown) ──────────────────────────────
    {
        "filename": "Incident_Report_IR2025003_Compressor_Shutdown.pdf",
        "content": """INCIDENT REPORT
Report No: IR-2025-003
Classification: Process Incident (Low Severity)
Date: February 5, 2025 | Time: 03:22
Location: Compression Unit 2 — Compressor C-204
Reported by: Night Shift Operator Ramesh Pillai | Investigated by: Priya Mehta

INCIDENT DESCRIPTION
At 03:22 on February 5, 2025, Compressor C-204 tripped on high-high discharge
temperature alarm (Tag: TI-204-DIS-HH).

Night shift operator Ramesh Pillai observed the following sequence on DCS:
- 03:19: Discharge temperature (TI-204-DIS) rose from 71°C to 85°C.
- 03:20: High temperature alarm (alarm setpoint: 90°C) activated.
- 03:22: High-high temperature (trip setpoint: 105°C) — C-204 tripped.

On reaching the field at 03:30, Ramesh Pillai observed that the inter-stage cooler
(IC-204-A) fan motor had stopped. Fan motor circuit breaker had tripped.

The suction drum V-301 remained pressurized; no pressure relief valve actuation.
Associated flare system: No increase in flare load observed.

DURATION OF OUTAGE
C-204 was offline from 03:22 to 07:45 (4 hours 23 minutes).
Production impact: Nil (gas diversion to C-205 completed at 03:28).

IMMEDIATE ACTIONS
1. Ramesh Pillai diverted gas throughput to standby Compressor C-205.
2. Reset fan motor circuit breaker at 04:10 — Fan restarted successfully.
3. C-204 restarted at 07:45 after temperature normalised.
4. Shift Manager Deepak Rao informed at 03:35.

ROOT CAUSE
Fan motor circuit breaker (Rating: 25A) tripped due to single-phase condition caused by
loose connection on Phase-B at the motor terminal box.
Loose connection resulted in motor overload → thermal overload relay activated → CB trip.

CORRECTIVE ACTIONS
Immediate:
- Terminal box connections re-terminated and torqued (07:15, Feb 5).
- Fan motor megger test: Insulation resistance 850 MΩ — acceptable.

Short-term (7 days):
- Electrical inspection of all cooling fan motor terminal boxes (C-204, C-205, C-206).
- Inspection completed February 10 by Electrician Suresh Babu — No further issues found.

Long-term (60 days):
- Include fan motor terminal box inspection in C-204 PM checklist.

REGULATORY REFERENCES
- OISD-105: Clause 8.3 — Reciprocating Compressor inspection requirements.
- Factories Act 1948: Section 21 — Machinery safety.

EQUIPMENT STATUS
C-204: Returned to service February 5, 07:45.
V-301: No abnormalities; pressure normal throughout incident.

Signatures:
Operator: Ramesh Pillai | Date: 05-Feb-2025
Investigation Lead: Priya Mehta | Date: 06-Feb-2025
HSE Officer: Anita Singh | Date: 06-Feb-2025
Plant Manager: Sunil Verma | Date: 07-Feb-2025
""",
    },

    # ── 10. Annual Safety Audit Report 2024 ──────────────────────────────────
    {
        "filename": "Annual_Safety_Audit_Report_2024.pdf",
        "content": """ANNUAL SAFETY AUDIT REPORT — 2024
Facility: Refinery Unit 3 & Gas Processing Plant
Audit Period: January 1, 2024 – December 31, 2024
Lead Auditor: External — Safeguard Consulting Pvt. Ltd. (Ravi Krishnamurthy)
Internal Coordinator: HSE Officer Anita Singh
Plant Manager: Sunil Verma

EXECUTIVE SUMMARY
This report presents the findings of the Annual Safety Audit conducted across all
process areas of the facility. The audit covered statutory compliance, process safety
management, emergency preparedness, and equipment integrity.

Overall Compliance Score: 84% (Target: 90%) — IMPROVEMENT REQUIRED.

AUDIT SCOPE
Areas audited: Process Area 3, Compression Unit 2, Utility Block, Maintenance Workshop.
Key Equipment Reviewed: Pump P-101, Compressor C-204, Heat Exchanger HX-502, Vessel V-301.
Regulatory Frameworks: OISD-105, OISD-147, OISD-GDN-192, Factory Act 1948, Petroleum Rules 2002.

MAJOR FINDINGS

Finding 1: Pump P-101 — Overdue Mechanical Seal Replacement [HIGH SEVERITY]
Reference: OISD-105 Clause 8.1
Observation: Mechanical seal on Pump P-101 was due for replacement in December 2024.
Replacement was deferred due to unavailability of spare part KBL-MS-P101-A.
Consequence: Near-miss incident NM-2025-017 occurred in January 2025 (outside audit
period but linked to this finding).
Recommendation: Implement critical spare parts tracking system. Ensure P-101 spares
are maintained at minimum 2-unit stock level at all times.
Status: CLOSED (seal replaced March 2025; spare parts review initiated).

Finding 2: Compressor C-204 — Quarterly Valve Inspection Backlog [MEDIUM SEVERITY]
Reference: OISD-105 Clause 8.3
Observation: Q3 2024 valve inspection was delayed by 3 weeks due to resource
constraints. Written risk assessment and extension approval not obtained.
Recommendation: Formal procedure required for PM deferrals including HSE Officer sign-off.
Status: OPEN — Procedure under development (target: April 2025).

Finding 3: Confined Space Entry Records — Incomplete Documentation [MEDIUM SEVERITY]
Reference: OISD-GDN-192, Factory Act Section 36
Observation: 3 of 12 confined space entry permits for HX-502 and V-301 reviewed were
missing post-entry sign-off (closing signature of Entry Supervisor).
Recommendation: Checklist verification required before permit filing.
Status: OPEN — Training refresher scheduled for Q1 2025.

Finding 4: Hot Work Permit Register — Missing Renewal Records [LOW SEVERITY]
Reference: OISD-105 Clause 6.5
Observation: 2 hot work permits issued in August 2024 were renewed but renewal records
not appended to original permit files.
Recommendation: Electronic permit management system recommended.
Status: OPEN.

Finding 5: Fire Water System — Pressure Shortfall During Test [HIGH SEVERITY]
Reference: OISD-105 Clause 15.1
Observation: During the annual fire water test (November 2024), residual pressure at
hydrant near C-204 measured 5.8 bar (required: 7 bar minimum).
Recommendation: Fire water ring main pump capacity review required.
Status: OPEN — Engineering study commissioned (Ravi Krishnamurthy, Nov 2024).

POSITIVE OBSERVATIONS
- Excellent housekeeping standards in Process Area 3 (around P-101 and HX-502).
- All safety signage updated and in good condition.
- Emergency evacuation drills conducted on schedule (4 drills in 2024).
- DRAGER gas detectors calibrated on time across all areas.
- Safety Officer Anita Singh maintaining comprehensive incident register.

INCIDENT STATISTICS — 2024
- Lost Time Injuries (LTI): 0 ✓
- Recordable Injuries: 1 (minor burn, workshop)
- Near-Misses Reported: 5
- Process Incidents: 2 (including C-204 compressor trip — IR-2025-003 precursor)

COMPLIANCE SUMMARY
| Regulation | Compliance % |
|------------|-------------|
| OISD-105   | 82%         |
| OISD-147   | 91%         |
| Factory Act 1948 | 87%  |
| Petroleum Rules 2002 | 85% |
| Overall    | 84%         |

RECOMMENDATIONS FOR 2025
1. Target: Close all OPEN findings by June 2025.
2. Implement electronic permit-to-work system.
3. Establish critical spare parts management program for P-101, C-204, HX-502.
4. Achieve 90%+ compliance score in next audit.

Audit Lead: Ravi Krishnamurthy (Safeguard Consulting) | Date: January 15, 2025
Internal Coordinator: Anita Singh | Date: January 20, 2025
Plant Manager: Sunil Verma | Date: January 22, 2025
""",
    },
]


def save_as_txt(doc: dict) -> Path:
    """Save document content as plain text file."""
    path = OUTPUT_DIR / doc["filename"].replace(".pdf", ".txt")
    path.write_text(doc["content"], encoding="utf-8")
    return path


def save_as_pdf(doc: dict) -> Path:
    """Save document content as a proper PDF using fpdf2."""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)

    for line in doc["content"].split("\n"):
        # Simple bold for ALL-CAPS lines (section headers)
        if line.isupper() and len(line) > 3:
            pdf.set_font("Helvetica", style="B", size=11)
            pdf.cell(0, 6, line, ln=True)
            pdf.set_font("Helvetica", size=10)
        else:
            pdf.multi_cell(0, 5, line)

    path = OUTPUT_DIR / doc["filename"]
    pdf.output(str(path))
    return path


def main():
    print(f"Generating {len(DOCUMENTS)} sample documents in: {OUTPUT_DIR}")

    for doc in DOCUMENTS:
        if HAS_FPDF:
            path = save_as_pdf(doc)
            print(f"  ✓ {path.name}")
        else:
            path = save_as_txt(doc)
            print(f"  ✓ {path.name} (txt fallback)")

    print(f"\nDone! {len(DOCUMENTS)} documents saved to: {OUTPUT_DIR}")
    print("\nEquipment cross-references in corpus:")
    print("  P-101  : docs 1, 4, 5, 6, 7, 8, 10")
    print("  C-204  : docs 2, 4, 6, 7, 9, 10")
    print("  HX-502 : docs 3, 4, 5, 6, 10")
    print("  V-301  : docs 2, 5, 6, 9, 10")
    print("\nPersonnel cross-references:")
    print("  Anita Singh  : docs 1, 2, 3, 4, 5, 8, 9, 10")
    print("  Sunil Verma  : docs 1, 2, 3, 4, 5, 8, 9, 10")
    print("  Rajesh Kumar : docs 1, 5, 8")
    print("  Priya Mehta  : docs 2, 8, 9")


if __name__ == "__main__":
    main()
