import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Cpu, Zap, Gauge, Activity, ChevronRight, LogIn, LogOut, ShieldCheck,
  FileCode, FolderKanban, Plus, Minus, Trash2, Check, X, Mail, GraduationCap,
  Wrench, CircuitBoard, CarFront, Eye, KeyRound, UserPlus, Save, ArrowLeft,
  CheckCircle2, AlertCircle, Lock, Award, Upload, FileText, Download,
  Building2, CalendarDays, Phone, Edit3, Search, Copy, Sparkles, MessageSquare, Moon, Sun, Clock,
  LayoutDashboard, Users, Hourglass, BadgeCheck, Settings as Cog, Quote, HelpCircle,
  IndianRupee, Video as VideoIcon, Play, TrendingUp, TrendingDown, CalendarClock,
  ListChecks, ShieldAlert, Shield, ScanLine, AlertTriangle, Home, Undo2, RotateCcw, History as HistoryIcon,
  Server, Radio, Network, ListOrdered, Monitor, Image as ImageIcon, FileSpreadsheet, Ban, RefreshCw, Inbox, BarChart3, Workflow, Wifi, WifiOff, Settings2
} from "lucide-react";

/* ================================================================== */
const KEY = "caee:db:v11";
const TODAY = () => new Date().toISOString().slice(0, 10);
const NOW = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 9);
const MAX_RESUME = 3 * 1024 * 1024;
const certId = (u) => `CAEE-${u.track === "btech" ? "B" : "M"}-${u.id.slice(0, 6).toUpperCase()}`;
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const PERMS = [
  ["view_progress", "View & grade student progress"],
  ["manage_access", "Grant / revoke course access"],
  ["manage_students", "Add / manage students & duration"],
  ["edit_btech_questions", "Edit B.Tech questions"],
  ["edit_mtech_questions", "Edit M.Tech questions"],
  ["edit_btech_projects", "Edit B.Tech projects"],
  ["edit_mtech_projects", "Edit M.Tech projects"],
  ["edit_content", "Edit landing content & module intros"],
  ["edit_pricing", "Edit pricing"],
  ["edit_registration", "Open / close registration"],
  ["manage_ai", "Manage AI mentor & API key"],
];
const LAB_IDS = { btech: ["C1", "C2", "C3", "BF", "B1", "B2", "B3", "B4", "B5", "B6"], mtech: ["C1", "C2", "C3", "MF", "M1", "M2", "M3", "M4", "M5", "M6", "M7"] }; // module ids the lab reports when a server-verified pass happens
const LAB_MODULE_COUNT = { btech: LAB_IDS.btech.length, mtech: LAB_IDS.mtech.length }; // the real interactive lab modules (B1-B6 / M1-M7) - independent of how many entries db.questions[track] lists, since Module 0 (intro videos) has no lab-progress counterpart
const TRACK = {
  btech: { tag: "B.Tech", name: "CAN/CAN-FD Communication & Safety", board: "NUCLEO-G474RE + MCP2562FD",
    blurb: "A CAN/CAN-FD communication and safety internship on the STM32 NUCLEO-G474RE. You'll build a deterministic embedded-C kernel, wire and diagnose a real two-node CAN-FD physical layer, work through frame arbitration and fault confinement, calculate valid FDCAN bit timing, design a protected signal-encoding scheme, and implement a receiver-side safe-state machine that rejects invalid traffic.",
    skill: "design and validate CAN/CAN-FD embedded firmware, from bit timing through fault-tolerant safe-state handling, on STM32 hardware", icon: Gauge },
  mtech: { tag: "M.Tech", name: "Sensored PMSM Field-Oriented Control (FOC) Motor Drive", board: "NUCLEO-G474RE + X-NUCLEO-IHM08M1",
    blurb: "A sensored motor-control internship on the STM32 NUCLEO-G474RE with the X-NUCLEO-IHM08M1 driver. You'll implement the full FOC stack — current sensing and ADC calibration, Clarke/Park transforms, discrete PI current control with anti-windup, SVPWM, and nested speed control — then close the loop on a digital twin with quantitative protection and verification experiments.",
    skill: "design and implement a sensored field-oriented control (FOC) motor drive on STM32 hardware", icon: Zap },
};

const MCQ_SEED = {
  btech: [
    [
      { q: "Which expression clears bit n of x without changing other bits?", o: ["x | (1<<n)", "x & ~(1<<n)", "x ^ (1<<n)", "x >> n"], a: 1, e: "AND with the inverted mask clears bit n." },
      { q: "Which expression sets bit n of x?", o: ["x | (1<<n)", "x & ~(1<<n)", "x & (1<<n)", "x ^ ~n"], a: 0, e: "OR with the mask sets the bit." },
      { q: "Which expression toggles bit n of x?", o: ["x & (1<<n)", "x | (1<<n)", "x ^ (1<<n)", "~x"], a: 2, e: "XOR flips the targeted bit." },
      { q: "How do you test whether bit n of x is set?", o: ["(x >> n) & 1", "x & n", "x % n", "x << n"], a: 0, e: "Shift down then mask the LSB." },
      { q: "For 8-bit math, 0xFF & ~(1<<7) equals:", o: ["0xFF", "0x7F", "0x80", "0x00"], a: 1, e: "Clearing bit 7 of 0xFF gives 0x7F." },
      { q: "Why declare a hardware register pointer 'volatile'?", o: ["Faster access", "Prevents the compiler optimising away reads/writes", "Makes it read-only", "Allocates it on the heap"], a: 1, e: "volatile forbids caching the value." },
      { q: "sizeof(uint8_t) is:", o: ["1 byte", "2 bytes", "4 bytes", "Depends on CPU"], a: 0, e: "uint8_t is exactly 8 bits." },
      { q: "Why prefer stdint types like uint32_t in embedded C?", o: ["Shorter to type", "Guaranteed fixed width across compilers", "Always faster", "Use less RAM"], a: 1, e: "Fixed-width and portable." },
      { q: "A read-modify-write on a register shared with an ISR is made safe by:", o: ["Using float", "A critical section (atomic access)", "Adding delay", "Using printf"], a: 1, e: "Protect the RMW from interruption." },
      { q: "Mask to keep only the lower nibble of x:", o: ["x & 0xF0", "x & 0x0F", "x | 0x0F", "x >> 4"], a: 1, e: "0x0F keeps the low 4 bits." },
      { q: "For unsigned x, x << 1 is equivalent to:", o: ["x / 2", "x * 2", "x % 2", "x - 1"], a: 1, e: "Left shift by 1 multiplies by 2." },
      { q: "Unsigned 8-bit 0xFF + 1 gives:", o: ["0x100", "0x00", "0xFF", "Error"], a: 1, e: "Wraps modulo 256." },
      { q: "Advantage of 'const' over '#define' for a constant:", o: ["It has type and scope", "It is faster", "It uses no memory", "It is global only"], a: 0, e: "const is type-checked and scoped." },
      { q: "Access a 32-bit register at fixed address 0x40020000 in C:", o: ["*(volatile uint32_t*)0x40020000", "int x = 0x40020000", "#define REG 0x40020000", "malloc(0x40020000)"], a: 0, e: "Cast to a volatile pointer and dereference." },
      { q: "~0 stored in an 8-bit unsigned variable is:", o: ["0x00", "0x7F", "0xFF", "0x01"], a: 2, e: "All bits set." },
      { q: "To clear several bits given MASK:", o: ["x |= MASK", "x &= ~MASK", "x ^= MASK", "x = MASK"], a: 1, e: "AND with the inverted mask." },
      { q: "Bitfield bit-ordering in C is:", o: ["Always MSB first", "Always LSB first", "Implementation-defined", "Illegal"], a: 2, e: "Layout is compiler-dependent." },
      { q: "Endianness matters when you:", o: ["Add two ints", "Access multi-byte data byte-by-byte", "Use a for loop", "Call a function"], a: 1, e: "Byte order affects multi-byte values." },
      { q: "Best way to avoid magic numbers for register bits:", o: ["Comment them", "Use named #define/enum masks", "Use floats", "Ignore them"], a: 1, e: "Named masks aid readability." },
      { q: "A 'wait until ready' poll loop should:", o: ["Loop forever blindly", "Use volatile and a timeout", "Use recursion", "Use malloc"], a: 1, e: "volatile read + timeout avoids hangs." },
    ],
    [
      { q: "Max count of a 12-bit ADC:", o: ["1024", "2048", "4095", "65535"], a: 2, e: "2^12 - 1." },
      { q: "ADC resolution (volts per step) equals:", o: ["Vref x 2^n", "Vref / 2^n", "2^n / Vref", "Vref"], a: 1, e: "LSB = Vref/2^n." },
      { q: "For Vref=3.3V and 12-bit, one LSB is about:", o: ["0.806 mV", "8.06 mV", "80.6 mV", "3.3 mV"], a: 0, e: "3.3/4096." },
      { q: "A dual-track throttle sensor mainly provides:", o: ["Higher resolution", "Plausibility / safety redundancy", "Lower cost", "Faster sampling"], a: 1, e: "Two correlated signals catch faults." },
      { q: "A throttle fault is flagged when:", o: ["Both tracks equal", "The tracks disagree beyond tolerance", "Value is high", "Value is low"], a: 1, e: "Divergence implies a fault." },
      { q: "Quantization error of an ideal ADC is about:", o: ["+/-1 LSB", "+/-0.5 LSB", "+/-2 LSB", "Zero"], a: 1, e: "Half a least-significant bit." },
      { q: "Averaging several ADC samples mainly:", o: ["Increases speed", "Reduces random noise", "Changes Vref", "Adds offset"], a: 1, e: "Improves SNR." },
      { q: "Anti-alias filtering is needed to:", o: ["Boost the signal", "Prevent high-frequency aliasing", "Increase Vref", "Save power"], a: 1, e: "Band-limit before sampling." },
      { q: "Mapping a raw count to 0-100%:", o: ["(raw-min)/(max-min)*100", "raw*100", "raw/4095", "100-raw"], a: 0, e: "Linear scale within calibrated range." },
      { q: "Calibration mainly corrects:", o: ["Offset and gain errors", "Clock speed", "Stack size", "ISR latency"], a: 0, e: "Removes systematic error." },
      { q: "Ratiometric sensing means the reading:", o: ["Is independent of Vref", "Scales with Vref", "Needs no ADC", "Is digital"], a: 1, e: "Output tracks the reference." },
      { q: "Using DMA with the ADC lets you:", o: ["Sample continuously without CPU per sample", "Increase resolution", "Remove noise", "Lower Vref"], a: 0, e: "DMA offloads transfers." },
      { q: "Too-short sampling time on a high-impedance source causes:", o: ["Better accuracy", "Incomplete sample/hold settling", "No effect", "Lower noise"], a: 1, e: "The S/H cap must charge fully." },
      { q: "Oversampling and decimation can:", o: ["Reduce resolution", "Increase effective resolution", "Increase Vref", "Add aliasing"], a: 1, e: "Trades speed for ENOB." },
      { q: "Why prefer fixed-point over float on a no-FPU MCU?", o: ["More accurate always", "Faster and deterministic", "Uses more flash", "Required for ADC"], a: 1, e: "Avoids slow soft-float." },
      { q: "A stuck throttle can be detected by:", o: ["Range and rate-of-change checks", "Higher Vref", "A larger buffer", "More ISRs"], a: 0, e: "Out-of-range or frozen value." },
      { q: "A stable voltage reference matters because:", o: ["It sets sampling rate", "ADC accuracy depends on Vref stability", "It powers the CPU", "It filters noise"], a: 1, e: "Reference drift = error." },
      { q: "Successive-approximation ADCs are known for:", o: ["Highest speed only", "A good speed/resolution balance", "No latency", "Analog output"], a: 1, e: "Convert bit-by-bit." },
      { q: "Nyquist requires sampling at least:", o: ["Equal to the signal frequency", "2x the highest signal frequency", "Half the signal frequency", "10x"], a: 1, e: "fs >= 2 fmax." },
      { q: "The two throttle tracks are typically:", o: ["Identical", "Correlated/complementary by design", "Random", "Unrelated"], a: 1, e: "Known relationship enables the check." },
    ],
    [
      { q: "Input capture records:", o: ["The timer count at an input edge", "An ADC value", "The stack pointer", "PWM duty"], a: 0, e: "Timestamps the edge." },
      { q: "A Hall-effect sensor responds to:", o: ["Light", "Magnetic field", "Pressure", "Temperature"], a: 1, e: "Senses magnetic flux." },
      { q: "Counter wrap-around between two captures is handled by:", o: ["Ignoring it", "Unsigned (modulo) subtraction of counts", "Resetting the CPU", "Using float"], a: 1, e: "Unsigned diff wraps correctly." },
      { q: "A timer prescaler:", o: ["Multiplies the clock", "Divides the timer clock", "Adds interrupts", "Sets PWM"], a: 1, e: "Divides the input clock." },
      { q: "A higher prescaler gives:", o: ["Finer resolution, shorter range", "Coarser resolution, longer range", "No change", "More ISRs"], a: 1, e: "Slower ticks = longer range, less resolution." },
      { q: "Frequency from a measured period T is:", o: ["T", "1/T", "T squared", "2T"], a: 1, e: "f = 1/T." },
      { q: "At very low speed, the better method is:", o: ["Count pulses in a fixed time", "Measure the period between pulses", "Use the ADC", "Poll faster"], a: 1, e: "Period method suits low speed." },
      { q: "At very high speed, prefer:", o: ["Period method", "Pulse counting over a fixed window", "Float math", "Disabling the timer"], a: 1, e: "Counting suits dense pulses." },
      { q: "Pulses per revolution depend on:", o: ["MCU clock", "Number of magnet poles/teeth", "Vref", "Stack size"], a: 1, e: "Mechanical pickup count." },
      { q: "RPM from period T (s) and P pulses/rev:", o: ["60/(T*P)", "T*P/60", "60*T*P", "P/T"], a: 0, e: "rev/s = 1/(T*P), times 60." },
      { q: "Input capture vs polling edges gives:", o: ["Less accurate timing", "Hardware-accurate timestamps with less CPU", "More CPU load", "Nothing"], a: 1, e: "Hardware latches the count." },
      { q: "An overflow (update) interrupt is used to:", o: ["Extend the effective timer range", "Reset the MCU", "Read the ADC", "Drive PWM"], a: 0, e: "Counts overflows to extend range." },
      { q: "Quadrature (two-channel) encoding additionally gives:", o: ["Direction of rotation", "Higher voltage", "Temperature", "Torque"], a: 0, e: "Phase relationship = direction." },
      { q: "To convert ticks to time you must know:", o: ["Vref", "The timer clock frequency", "Stack size", "Heap size"], a: 1, e: "time = ticks / f_timer." },
      { q: "Zero speed (stopped) is best detected by:", o: ["A no-pulse timeout", "Reading the ADC", "A larger buffer", "Faster polling"], a: 0, e: "No edges within a timeout." },
      { q: "Capture/compare channels on a timer can:", o: ["Only count", "Capture inputs and generate outputs (PWM)", "Only PWM", "Only delay"], a: 1, e: "CC units do both." },
      { q: "Edge selection for capture means choosing:", o: ["Rising/falling/both edges", "The clock source", "Vref", "Priority"], a: 0, e: "Which transition triggers capture." },
      { q: "Linear wheel speed from RPM needs:", o: ["Wheel circumference", "Vref", "Stack size", "Heap"], a: 0, e: "v = RPM * circumference / 60." },
      { q: "Timing jitter comes mainly from:", o: ["Clock instability and edge noise", "Large flash", "Comments", "Variable names"], a: 0, e: "Clock and signal noise." },
      { q: "A noisy Hall signal with spurious edges is improved by:", o: ["Hysteresis/filtering on the input", "Higher Vref", "More RAM", "Float math"], a: 0, e: "Schmitt/hysteresis rejects noise." },
    ],
    [
      { q: "CAN stands for:", o: ["Computer Area Net", "Controller Area Network", "Central Access Node", "Control Address Number"], a: 1, e: "Controller Area Network." },
      { q: "CAN is fundamentally:", o: ["Address-based", "Message/identifier-based", "Master-slave only", "Point-to-point"], a: 1, e: "Frames carry IDs, not node addresses." },
      { q: "In arbitration, the winning message has the:", o: ["Highest ID value", "Lowest ID value (highest priority)", "Longest data", "Most nodes"], a: 1, e: "Lower ID wins; dominant bits override." },
      { q: "A dominant bit on CAN is logic:", o: ["1 (recessive)", "0", "High-Z", "Undefined"], a: 1, e: "0 is dominant, overrides recessive 1." },
      { q: "Standard CAN identifier length is:", o: ["8 bits", "11 bits", "16 bits", "29 bits"], a: 1, e: "Base = 11-bit; extended = 29-bit." },
      { q: "Maximum payload of a classic CAN frame:", o: ["4 bytes", "8 bytes", "16 bytes", "64 bytes"], a: 1, e: "Classic CAN = up to 8 data bytes." },
      { q: "CAN physical signalling uses:", o: ["Single-ended TTL", "Differential CANH/CANL", "Optical", "RS-232 levels"], a: 1, e: "Differential pair for noise immunity." },
      { q: "Each end of a CAN bus is terminated with:", o: ["50 ohm", "120 ohm", "330 ohm", "1 kohm"], a: 1, e: "120 ohm at both ends." },
      { q: "Bit stuffing inserts an opposite bit after:", o: ["3 identical bits", "5 identical bits", "8 identical bits", "every bit"], a: 1, e: "After 5 same-polarity bits." },
      { q: "The ACK slot in a CAN frame is driven by:", o: ["The transmitter", "Receivers that got a valid frame", "The terminator", "The bootloader"], a: 1, e: "Receivers acknowledge." },
      { q: "CAN media access is best described as:", o: ["CSMA/CD (destructive)", "CSMA/CR (non-destructive arbitration)", "TDMA", "Token ring"], a: 1, e: "Priority arbitration loses no data." },
      { q: "A node goes 'bus-off' when:", o: ["REC > 96", "TEC exceeds 255", "CRC passes", "ACK received"], a: 1, e: "Transmit error counter over 255." },
      { q: "CAN error detection includes:", o: ["CRC, ACK, form, bit and stuff checks", "Only CRC", "Only parity", "None"], a: 0, e: "Several complementary checks." },
      { q: "A remote (RTR) frame is used to:", o: ["Send data", "Request data from another node", "Reset the bus", "Acknowledge"], a: 1, e: "Requests transmission of a frame." },
      { q: "The CAN bit time segments set the:", o: ["Payload size", "Sample point / synchronisation", "ID length", "Terminator"], a: 1, e: "Sync, prop, phase1/2 set sampling." },
      { q: "Typical CAN bit rates include:", o: ["9600 only", "125k / 250k / 500k / 1M", "10M fixed", "Any analog rate"], a: 1, e: "Common classic-CAN rates." },
      { q: "CAN FD primarily adds:", o: ["More nodes", "Flexible higher data-rate and up to 64-byte payload", "Optical PHY", "Node addressing"], a: 1, e: "Flexible Data-rate, larger payload." },
      { q: "CAN node error states are:", o: ["On/off", "Error-active, error-passive, bus-off", "Idle/busy", "Master/slave"], a: 1, e: "Set by TEC/REC counters." },
      { q: "Acceptance filters/masks let a controller:", o: ["Increase bit rate", "Receive only IDs of interest", "Terminate the bus", "Boost voltage"], a: 1, e: "Hardware filtering cuts CPU load." },
      { q: "Bus length and bit rate are related so that:", o: ["Higher rate allows longer bus", "Higher rate means shorter max bus length", "No relation", "Length sets the ID"], a: 1, e: "Propagation delay limits length." },
    ],
    [
      { q: "An RTOS mainly provides:", o: ["Graphics", "Deterministic task scheduling", "A filesystem", "A compiler"], a: 1, e: "Predictable real-time scheduling." },
      { q: "FreeRTOS task states include:", o: ["On/off", "Running, Ready, Blocked, Suspended", "Hot/cold", "Open/closed"], a: 1, e: "Standard task model." },
      { q: "A preemptive scheduler runs:", o: ["The oldest task", "The highest-priority ready task", "A random task", "The idle task always"], a: 1, e: "Highest priority ready task." },
      { q: "For inter-task data passing, use a:", o: ["Queue", "printf", "Global delay", "NOP"], a: 0, e: "Queues pass data safely." },
      { q: "A mutex differs from a binary semaphore by adding:", o: ["Faster speed", "Priority inheritance", "More memory", "Interrupts"], a: 1, e: "Mitigates priority inversion." },
      { q: "Priority inversion is when:", o: ["A high-priority task waits on a resource held by a low one", "The CPU overheats", "The stack overflows", "Two ISRs run"], a: 0, e: "Low task blocks a high task." },
      { q: "For a precise periodic task, use:", o: ["vTaskDelay", "vTaskDelayUntil", "a busy-wait", "a NOP loop"], a: 1, e: "DelayUntil keeps a fixed period." },
      { q: "ISR-safe FreeRTOS APIs end with:", o: ["_Fast", "FromISR", "_Safe", "_IRQ"], a: 1, e: "e.g. xQueueSendFromISR." },
      { q: "Blocking on a queue (vs busy-wait):", o: ["Wastes CPU", "Frees the CPU for other tasks", "Crashes", "Disables interrupts"], a: 1, e: "Blocked task yields the CPU." },
      { q: "The idle task runs when:", o: ["Always", "No other task is ready", "On reset only", "During an ISR"], a: 1, e: "Lowest priority fallback." },
      { q: "A counting semaphore best manages:", o: ["One exclusive resource", "A pool of N resources", "printf", "Delays"], a: 1, e: "Counts available instances." },
      { q: "A context switch saves/restores:", o: ["Only the PC", "The task's CPU registers and stack pointer", "Flash", "Nothing"], a: 1, e: "Full task context." },
      { q: "The tick interrupt is used to:", o: ["Drive timekeeping and scheduling", "Read the ADC", "Send CAN", "Blink an LED"], a: 0, e: "System tick paces the scheduler." },
      { q: "Task stack overflow is best caught with:", o: ["printf", "The FreeRTOS stack-overflow hook", "A bigger heap", "Disabling tasks"], a: 1, e: "Overflow checking hook." },
      { q: "Deadlock can occur when:", o: ["One task runs", "Tasks wait on each other's locks in a cycle", "The CPU is idle", "A queue is empty"], a: 1, e: "Circular lock dependency." },
      { q: "A critical section briefly:", o: ["Adds delay", "Disables preemption/interrupts", "Allocates heap", "Starts a task"], a: 1, e: "Protects short shared access." },
      { q: "Task notifications vs queues are:", o: ["Heavier", "Lighter/faster for simple signalling", "Slower", "Identical"], a: 1, e: "Low-overhead direct signalling." },
      { q: "Starvation happens when:", o: ["High-priority tasks never yield and low ones never run", "The heap is full", "An ISR fires", "A tick is missed"], a: 0, e: "Lower tasks get no CPU." },
      { q: "FreeRTOS heap schemes (heap_1..5) differ in:", o: ["Color", "Allocation/free strategy and fragmentation", "ADC speed", "ISR count"], a: 1, e: "Memory management trade-offs." },
      { q: "In FreeRTOS, a larger priority number means:", o: ["Lower priority", "Higher priority", "No priority", "Undefined"], a: 1, e: "Higher value = higher priority." },
    ],
    [
      { q: "A finite state machine helps firmware by:", o: ["Adding randomness", "Making behaviour predictable and testable", "Saving flash only", "Removing ISRs"], a: 1, e: "Defined states/transitions." },
      { q: "A watchdog timer:", o: ["Logs data", "Resets the MCU if not serviced", "Reads the ADC", "Sends CAN"], a: 1, e: "Recovers from hangs." },
      { q: "On a critical fault the ECU should:", o: ["Ignore it", "Enter a safe / fail-safe state", "Speed up", "Reboot randomly"], a: 1, e: "Fail safe / limp mode." },
      { q: "Sensor fusion means:", o: ["Deleting sensors", "Combining sensors for a better estimate", "Using one sensor", "Calibrating Vref"], a: 1, e: "Merge data for robustness." },
      { q: "Telemetry frame integrity is protected with:", o: ["Comments", "Checksums / CRC", "A bigger stack", "Floats"], a: 1, e: "Detects corruption." },
      { q: "A real-time deadline means:", o: ["Code is fast", "A task must finish within a bounded time", "No ISRs", "Low power"], a: 1, e: "Guaranteed timing bound." },
      { q: "Brown-out detection guards against:", o: ["High temperature", "Low / unstable supply voltage", "Stack overflow", "CAN errors"], a: 1, e: "Resets on under-voltage." },
      { q: "Graceful degradation means:", o: ["Full stop on any fault", "Reduced but safe operation on partial failure", "Faster operation", "Ignoring faults"], a: 1, e: "Keep core function safe." },
      { q: "Power-on self-test (POST) runs:", o: ["Never", "At startup to verify subsystems", "Only on a fault", "During sleep"], a: 1, e: "Validates hardware at boot." },
      { q: "Diagnostic trouble codes (DTCs) are used to:", o: ["Speed up CAN", "Record and report faults", "Increase Vref", "Schedule tasks"], a: 1, e: "Standard fault logging." },
      { q: "Safe defaults at startup mean:", o: ["Random outputs", "Actuators start in a known safe state", "Max throttle", "No init"], a: 1, e: "Deterministic safe init." },
      { q: "Interrupt-priority configuration ensures:", o: ["All ISRs equal", "Time-critical ISRs preempt less-critical ones", "No ISRs", "Slower code"], a: 1, e: "Critical events first." },
      { q: "Modular firmware architecture improves:", o: ["Clock speed", "Maintainability and testability", "Vref", "Flash size only"], a: 1, e: "Separation of concerns." },
      { q: "Hardware-in-the-loop (HIL) testing validates:", o: ["Only the UI", "Firmware against simulated/real plant I/O", "The compiler", "Documentation"], a: 1, e: "Realistic I/O testing." },
      { q: "A circular (ring) buffer is good for:", o: ["Random access", "Streaming log/sensor data without malloc", "Sorting", "Math"], a: 1, e: "Fixed-size FIFO." },
      { q: "Time synchronisation across nodes matters for:", o: ["Color", "Correlating timestamped telemetry", "Vref", "Stack"], a: 1, e: "Aligned event timing." },
      { q: "Logging is mainly for:", o: ["Speed", "Debugging and post-mortem analysis", "Lower power", "More RAM"], a: 1, e: "Traceability." },
      { q: "Buffer overflow is prevented by:", o: ["Ignoring length", "Bounds-checking writes", "A bigger Vref", "More ISRs"], a: 1, e: "Validate indices and lengths." },
      { q: "An emergency-stop path should be:", o: ["Software-only and slow", "Fast and high-priority (often hardware-assisted)", "Optional", "Polled rarely"], a: 1, e: "Immediate safe shutdown." },
      { q: "Unit vs integration testing differ in:", o: ["Language", "Scope: a single module vs interacting modules", "Speed only", "Nothing"], a: 1, e: "Granularity of the test." },
    ],
  ],
  mtech: [
    [
      { q: "PMSM stands for:", o: ["Pulse Motor", "Permanent Magnet Synchronous Motor", "Programmable MSM", "Phase Modulated SM"], a: 1, e: "Permanent Magnet Synchronous Motor." },
      { q: "FOC controls torque by regulating:", o: ["Bus voltage", "The d-q axis currents", "PWM frequency", "Temperature"], a: 1, e: "Field-oriented current control." },
      { q: "The Clarke transform converts:", o: ["abc to alpha-beta (stationary)", "abc to dq", "dq to abc", "alpha-beta to dq"], a: 0, e: "Three-phase to 2-axis stationary." },
      { q: "The Park transform requires:", o: ["Bus current", "Rotor electrical angle theta", "PWM frequency", "Phase resistance"], a: 1, e: "Rotates alpha-beta into dq." },
      { q: "In FOC the d-axis is aligned with:", o: ["The stator", "The rotor flux / magnet axis", "The q-axis", "Ground"], a: 1, e: "d = direct/flux axis." },
      { q: "For a surface PMSM, torque is produced mainly by:", o: ["id", "iq", "Bus voltage", "theta"], a: 1, e: "Torque proportional to iq." },
      { q: "Common d-axis current command for SPMSM below base speed:", o: ["id = iq", "id = 0", "id = max", "id = -iq"], a: 1, e: "id=0 maximises torque-per-amp." },
      { q: "Why transform into the rotating dq frame?", o: ["To use AC math", "DC quantities are easier to control with PI", "To save power", "To increase speed"], a: 1, e: "Steady-state dq are DC." },
      { q: "For a balanced 3-phase system, ia+ib+ic equals:", o: ["Vdc", "0", "iq", "theta"], a: 1, e: "Sums to zero with no neutral." },
      { q: "Electrical angle relates to mechanical angle by:", o: ["They are equal", "Multiply by pole pairs", "Divide by Vdc", "Add theta"], a: 1, e: "theta_e = pole_pairs x theta_m." },
      { q: "Inverse Park converts:", o: ["dq to alpha-beta", "abc to dq", "alpha-beta to abc", "dq to abc"], a: 0, e: "Back to the stationary frame." },
      { q: "In steady state, dq currents are:", o: ["Sinusoidal", "DC (constant)", "Zero", "Random"], a: 1, e: "The benefit of the rotating frame." },
      { q: "PMSM back-EMF is ideally:", o: ["Square", "Sinusoidal", "Triangular", "DC"], a: 1, e: "Sinusoidal vs trapezoidal BLDC." },
      { q: "Amplitude-invariant Clarke uses a factor of:", o: ["1", "2/3", "3/2", "sqrt(3)"], a: 1, e: "2/3 preserves amplitude." },
      { q: "theta for the Park transform comes from:", o: ["The ADC", "An encoder or position observer", "Vref", "The prescaler"], a: 1, e: "Measured or estimated position." },
      { q: "Field weakening uses:", o: ["Positive id", "Negative id", "iq = 0", "Higher Vref"], a: 1, e: "Negative id reduces flux for high speed." },
      { q: "FOC decouples:", o: ["Voltage and current", "Torque (q) and flux (d) control", "Speed and Vdc", "ADC and PWM"], a: 1, e: "Independent torque/flux axes." },
      { q: "A space vector represents:", o: ["A scalar", "The 3-phase quantity as one rotating vector", "Only ia", "Temperature"], a: 1, e: "Single vector in the alpha-beta plane." },
      { q: "BLDC control differs from PMSM because BLDC has:", o: ["Sinusoidal back-EMF", "Trapezoidal back-EMF (often six-step)", "No magnets", "No rotor"], a: 1, e: "Trapezoidal = six-step." },
      { q: "Clarke and Park transforms are:", o: ["Lossy", "Linear / orthogonal mappings", "Random", "Nonlinear only"], a: 1, e: "Linear coordinate transforms." },
    ],
    [
      { q: "A PI controller combines:", o: ["Proportional + Integral", "Proportional + Derivative", "Integral + Derivative", "Three integrals"], a: 0, e: "P and I terms." },
      { q: "The integral term's main job is to:", o: ["Increase speed only", "Eliminate steady-state error", "Add noise", "Reduce bandwidth"], a: 1, e: "Drives steady error to zero." },
      { q: "Integrator windup happens when:", o: ["The output saturates while error persists and the integral keeps growing", "Kp = 0", "Speed is zero", "There is no load"], a: 0, e: "Saturation + accumulating integral." },
      { q: "Anti-windup is used to:", o: ["Increase Kp", "Limit/condition the integrator during saturation", "Add derivative action", "Filter the ADC"], a: 1, e: "Prevents overshoot from windup." },
      { q: "The current loop is the:", o: ["Outermost, slowest", "Innermost, fastest loop", "Same as the speed loop", "Unused"], a: 1, e: "Fast inner torque loop." },
      { q: "Cross-coupling decoupling terms involve:", o: ["omega*L*i terms between d and q", "Vref", "ADC offset", "PWM dead-time"], a: 0, e: "Speed-voltage coupling compensation." },
      { q: "Loop bandwidth must be well below the:", o: ["Vdc", "PWM / sampling frequency", "theta", "Kp"], a: 1, e: "Sampling limits bandwidth." },
      { q: "Kp mainly affects:", o: ["Steady-state error", "Response speed / transient", "DC offset", "Nothing"], a: 1, e: "Proportional gain sets responsiveness." },
      { q: "The current-loop PI output is a:", o: ["Speed command", "Voltage command (to SVPWM)", "theta", "Temperature"], a: 1, e: "Voltage reference for modulation." },
      { q: "A common anti-windup method is:", o: ["Back-calculation / integrator clamping", "Increasing Ki", "Removing P", "Adding noise"], a: 0, e: "Clamp or back-calculate." },
      { q: "Two current PI controllers are needed for:", o: ["The d and q axes", "The abc phases", "Speed and position", "Vdc and theta"], a: 0, e: "Separate d and q loops." },
      { q: "Discretising a PI controller uses:", o: ["FFT", "Backward/forward Euler or Tustin", "Clarke", "Park"], a: 1, e: "Numerical integration." },
      { q: "Higher Ki tends to:", o: ["Slow integral action", "Speed up correction but risk overshoot", "Remove P", "Lower bandwidth"], a: 1, e: "More aggressive integral." },
      { q: "Current sampling is usually synchronised to:", o: ["Random times", "The PWM (e.g. mid-cycle)", "theta = 0 only", "ADC reset"], a: 1, e: "PWM-aligned sampling." },
      { q: "The plant model for tuning uses motor:", o: ["Color", "Resistance R and inductance L", "Vref", "Mass"], a: 1, e: "R and L set electrical dynamics." },
      { q: "Feedforward in the current loop:", o: ["Slows response", "Improves transient by predicting the voltage", "Adds windup", "Removes PI"], a: 1, e: "Anticipates required voltage." },
      { q: "Adequate phase margin ensures:", o: ["Faster only", "Stability / robustness", "More noise", "Zero error"], a: 1, e: "Stability metric." },
      { q: "We control current in FOC because:", o: ["Voltage sets torque", "Current is proportional to torque", "Current is ignored", "Position needs it"], a: 1, e: "Torque proportional to current." },
      { q: "Phase-current measurement noise is handled by:", o: ["Ignoring it", "Filtering / good sampling", "Higher Vdc", "Removing PI"], a: 1, e: "Filter or sync sampling." },
      { q: "Total current-loop delay includes:", o: ["Only PWM", "Sampling, computation and PWM-update delays", "Only ADC", "None"], a: 1, e: "Several discrete delays." },
    ],
    [
      { q: "SVPWM stands for:", o: ["Sine Vector PWM", "Space Vector PWM", "Single Voltage PWM", "Switched Vector PM"], a: 1, e: "Space Vector PWM." },
      { q: "Versus sinusoidal PWM, SVPWM gives:", o: ["Lower bus utilisation", "About 15% higher DC-bus utilisation", "More harmonics", "Less efficiency"], a: 1, e: "Better use of Vdc." },
      { q: "A 3-phase 2-level inverter has:", o: ["3 switches", "6 switches (3 legs)", "2 switches", "12 switches"], a: 1, e: "Two switches per leg." },
      { q: "SVPWM has how many active voltage vectors?", o: ["2", "4", "6", "8"], a: 2, e: "Six active plus two zero vectors." },
      { q: "The zero vectors are:", o: ["V1 and V2", "V0 and V7", "V3 and V4", "None"], a: 1, e: "All-low and all-high states." },
      { q: "Dead-time between high/low switches prevents:", o: ["Low torque", "Shoot-through (DC short)", "Aliasing", "Windup"], a: 1, e: "Stops both switches conducting." },
      { q: "The SVPWM hexagon is divided into:", o: ["3 sectors", "6 sectors", "8 sectors", "12 sectors"], a: 1, e: "Six 60-degree sectors." },
      { q: "Dwell times are computed from:", o: ["theta only", "The reference vector's magnitude and angle", "the ADC", "Temperature"], a: 1, e: "Project Vref onto adjacent vectors." },
      { q: "Dead-time causes:", o: ["No effect", "Output voltage distortion needing compensation", "Higher Vdc", "Faster switching"], a: 1, e: "Introduces a compensable error." },
      { q: "Modulation index describes:", o: ["Switching loss", "How much of the available voltage is used", "theta", "Current"], a: 1, e: "Output vs max linear voltage." },
      { q: "Max linear phase voltage with SVPWM is about:", o: ["Vdc", "Vdc/2", "Vdc/sqrt(3)", "2*Vdc"], a: 2, e: "Peak phase about Vdc/sqrt(3)." },
      { q: "Center-aligned (symmetric) PWM reduces:", o: ["Torque", "Harmonic content", "Vdc", "Resolution"], a: 1, e: "Symmetric switching lowers THD." },
      { q: "PWM duty resolution comes from:", o: ["ADC bits", "Timer counter resolution vs PWM period", "Vref", "theta"], a: 1, e: "Timer ticks per period." },
      { q: "Overmodulation occurs when the:", o: ["Index < 1", "Reference exceeds the linear hexagon limit", "theta = 0", "Current = 0"], a: 1, e: "Beyond the linear region." },
      { q: "Switching-frequency trade-off:", o: ["Higher means less loss", "Higher means smoother current but more switching loss", "No effect", "Always lower harmonics"], a: 1, e: "Loss vs ripple." },
      { q: "Common-mode voltage is influenced by:", o: ["Zero-vector placement", "Vref", "theta only", "the ADC"], a: 0, e: "Zero-vector distribution." },
      { q: "Inverse Park feeds SVPWM with:", o: ["abc currents", "A stationary-frame voltage reference", "theta only", "Vdc"], a: 1, e: "alpha-beta voltage command." },
      { q: "Shoot-through protection is mainly:", o: ["Software delay only", "Hardware/firmware dead-time insertion", "Higher Vref", "Slower ADC"], a: 1, e: "Dead-time prevents leg short." },
      { q: "SVPWM vs SPWM total harmonic distortion:", o: ["SVPWM higher", "SVPWM generally lower", "Equal always", "Random"], a: 1, e: "Better harmonic performance." },
      { q: "In steady FOC, the reference voltage vector:", o: ["Is static", "Rotates at electrical frequency", "Is zero", "Equals Vdc"], a: 1, e: "Rotates with the field." },
    ],
    [
      { q: "In cascaded control, the speed loop is:", o: ["Inner/fastest", "Outer/slower than the current loop", "The same speed", "Unused"], a: 1, e: "Outer, slower loop." },
      { q: "The speed PI controller outputs:", o: ["A voltage", "A torque / iq reference", "theta", "Vdc"], a: 1, e: "Commands the inner current loop." },
      { q: "Bandwidth separation between loops is typically:", o: ["1x", "5-10x (inner faster)", "100x", "Equal"], a: 1, e: "Inner several times faster." },
      { q: "Speed is commonly obtained from:", o: ["ADC of current", "The derivative of rotor angle (filtered)", "Vdc", "Dead-time"], a: 1, e: "d(theta)/dt, filtered." },
      { q: "With a PI speed loop, steady-state speed error for a step is:", o: ["Large", "Zero", "Negative", "Unbounded"], a: 1, e: "Integral removes it." },
      { q: "Torque limiting is implemented by:", o: ["Clamping the iq reference", "Raising Vdc", "Removing PI", "Lowering theta"], a: 0, e: "Saturate the current command." },
      { q: "Higher load inertia generally requires:", o: ["A faster loop", "Retuning (slower / more integral)", "No change", "Higher Vref"], a: 1, e: "Inertia changes dynamics." },
      { q: "Above base speed the drive uses:", o: ["Field weakening", "More current only", "Higher Vref", "Dead-time"], a: 0, e: "Negative id extends the range." },
      { q: "A speed ramp/profile is used to:", o: ["Increase noise", "Limit acceleration / smooth the reference", "Raise Vdc", "Remove PI"], a: 1, e: "Controlled rate of change." },
      { q: "Anti-windup on the speed loop is needed because:", o: ["No reason", "The iq output saturates at the torque limit", "theta wraps", "Vdc varies"], a: 1, e: "Output saturation." },
      { q: "Speed-estimate filtering trades:", o: ["Cost vs color", "Noise vs phase lag/latency", "Vdc vs theta", "Nothing"], a: 1, e: "More filtering = more delay." },
      { q: "A position loop, if present, is the:", o: ["Innermost", "Outermost (around speed)", "Same as current", "Unused"], a: 1, e: "Outermost cascade." },
      { q: "Load-torque disturbance is rejected by:", o: ["P only", "Integral action / feedforward", "Removing PI", "Higher Vref"], a: 1, e: "Integral plus optional feedforward." },
      { q: "Encoder resolution most affects:", o: ["Vdc", "Low-speed estimate accuracy", "Dead-time", "Switching frequency"], a: 1, e: "Few counts = noisy low-speed." },
      { q: "The speed-loop sample rate is usually:", o: ["Faster than the current loop", "Slower than the current loop", "Equal to PWM", "Random"], a: 1, e: "Outer loop runs slower." },
      { q: "Overshoot in speed response is reduced by:", o: ["More Kp only", "Adequate damping / tuning", "Removing I", "Higher Vdc"], a: 1, e: "Proper gain and damping." },
      { q: "Cascaded loops are stable when:", o: ["Loops have equal bandwidth", "The inner loop is much faster than the outer", "The outer is faster", "There is no PI"], a: 1, e: "Time-scale separation." },
      { q: "Feedforward of a known load:", o: ["Hurts response", "Improves tracking / disturbance rejection", "Adds windup", "Removes PI"], a: 1, e: "Anticipates the load." },
      { q: "Speed ripple can originate from:", o: ["Cogging/torque ripple and sensor noise", "Comments", "A Vref label", "The stack"], a: 0, e: "Mechanical and sensing effects." },
      { q: "The speed loop commands torque via:", o: ["Voltage directly", "iq through the current loop", "theta", "Dead-time"], a: 1, e: "iq reference to the current loop." },
    ],
    [
      { q: "Sensorless control estimates rotor position:", o: ["With an encoder", "Without a position sensor", "With a Hall only", "From Vdc"], a: 1, e: "No mechanical position sensor." },
      { q: "Back-EMF magnitude is proportional to:", o: ["Current", "Speed", "Vdc", "Temperature"], a: 1, e: "Higher speed = larger back-EMF." },
      { q: "The hardest regime for back-EMF sensorless is:", o: ["High speed", "Low speed / standstill", "Mid speed", "Steady state"], a: 1, e: "Back-EMF too small at low speed." },
      { q: "A sliding-mode observer estimates:", o: ["Vdc", "Back-EMF / rotor states from current error", "theta from an encoder", "Temperature"], a: 1, e: "Robust state estimation." },
      { q: "A PLL in sensorless FOC extracts:", o: ["Vdc", "Rotor angle and speed from estimated EMF", "Current", "Dead-time"], a: 1, e: "Tracks angle and speed." },
      { q: "At standstill/low speed, position can be found via:", o: ["Back-EMF", "High-frequency injection / saliency", "Vdc", "A bigger encoder"], a: 1, e: "Saliency-based injection." },
      { q: "Observers depend on motor parameters:", o: ["Color", "R, L and flux linkage", "A Vref label", "The stack"], a: 1, e: "Model-based estimation needs params." },
      { q: "Angle-estimation error causes:", o: ["Higher Vdc", "Torque loss / inefficiency", "Lower switching frequency", "No effect"], a: 1, e: "Misaligned dq reduces torque." },
      { q: "Sensorless startup often uses:", o: ["Immediate closed loop", "Align-and-go / open-loop ramp then handoff", "An encoder", "A Hall sensor"], a: 1, e: "Forced commutation builds EMF." },
      { q: "Open-to-closed-loop handoff occurs when:", o: ["Vdc is high", "Estimated back-EMF/speed is reliable", "theta = 0", "Current = 0"], a: 1, e: "Switch once the estimate is valid." },
      { q: "Phase-current measurement is:", o: ["Optional", "Required for the observer", "Only at startup", "For Vdc"], a: 1, e: "Currents drive estimation." },
      { q: "A Luenberger observer uses:", o: ["Random gains", "A model plus correction from output error", "An encoder", "FFT"], a: 1, e: "Model-based with feedback." },
      { q: "Estimation noise sensitivity is worst when:", o: ["Speed is high", "Signals are small (low speed)", "Vdc is high", "theta = 90"], a: 1, e: "Low SNR at low speed." },
      { q: "In the alpha-beta frame, back-EMF appears as:", o: ["DC", "Sinusoidal components", "Zero", "Square"], a: 1, e: "Sinusoidal in the stationary frame." },
      { q: "A key advantage of sensorless drives:", o: ["Higher torque", "Lower cost / no encoder and better reliability", "More wires", "Higher Vdc"], a: 1, e: "Removes the sensor." },
      { q: "BLDC six-step sensorless often uses:", o: ["HF injection", "Back-EMF zero-crossing detection", "An encoder", "Vdc"], a: 1, e: "Zero-crossing of the floating phase." },
      { q: "Observer convergence means:", o: ["The estimate diverges", "Estimated states track the real ones", "theta = 0", "Current = 0"], a: 1, e: "Error decays toward zero." },
      { q: "Speed is derived in sensorless control from:", o: ["The ADC", "The estimated angle rate / PLL", "Vdc", "Dead-time"], a: 1, e: "From the estimated angle." },
      { q: "A wrong inductance value (parameter mismatch) leads to:", o: ["A perfect estimate", "Angle/speed estimation error", "Higher Vdc", "Lower THD"], a: 1, e: "Model error degrades the estimate." },
      { q: "A PLL loop filter trades:", o: ["Cost vs color", "Tracking speed vs noise rejection", "Vdc vs theta", "Nothing"], a: 1, e: "Bandwidth trade-off." },
    ],
    [
      { q: "The 'align' step in startup:", o: ["Spins fast", "Applies current to lock the rotor to a known position", "Reads the encoder", "Charges Vdc"], a: 1, e: "Forces a known initial angle." },
      { q: "After align, the ramp step:", o: ["Stops", "Increases commutation frequency open-loop", "Reduces Vdc", "Disables PWM"], a: 1, e: "Accelerates to build back-EMF." },
      { q: "Handoff to closed loop happens when:", o: ["Vdc is max", "Estimated position/speed is reliable", "theta = 0", "Current = 0"], a: 1, e: "Once the observer is valid." },
      { q: "A safe-start gate:", o: ["Always enables PWM", "Blocks PWM until safety checks pass", "Increases Vref", "Removes dead-time"], a: 1, e: "No drive until safe." },
      { q: "Over-current protection should:", o: ["Log only", "Trip / disable PWM quickly (often in hardware)", "Increase current", "Slow down"], a: 1, e: "Fast fault shutdown." },
      { q: "Gate-driver bootstrap capacitors must be:", o: ["Discharged", "Pre-charged before high-side switching", "Removed", "Shorted"], a: 1, e: "Charge before operation." },
      { q: "Desaturation detection protects:", o: ["The ADC", "The power switches", "The encoder", "Vref"], a: 1, e: "Detects switch over-current." },
      { q: "Current-sense offset calibration is done:", o: ["Never", "At startup with zero current", "At full load", "After a fault only"], a: 1, e: "Zero-current baseline." },
      { q: "On a serious fault the inverter typically:", o: ["Speeds up", "Disables PWM (coast) or brakes safely", "Ignores it", "Raises Vdc"], a: 1, e: "Safe shutdown." },
      { q: "A fault should be:", o: ["Auto-cleared instantly", "Latched until explicitly cleared", "Ignored", "Logged only"], a: 1, e: "Latch prevents unsafe restart." },
      { q: "Under-voltage lockout (UVLO) prevents:", o: ["Over-speed", "Operating with insufficient gate/supply voltage", "High torque", "Low THD"], a: 1, e: "Avoids weak-drive faults." },
      { q: "Over-temperature protection uses:", o: ["An encoder", "A temperature sensor to derate/trip", "Vref", "theta"], a: 1, e: "Thermal shutdown / derate." },
      { q: "Dead-time must be configured:", o: ["After running", "Before enabling the inverter", "Never", "Only on a fault"], a: 1, e: "Set prior to switching." },
      { q: "A stall is detected by:", o: ["High speed", "No motion despite a current command", "Low Vdc", "theta = 0"], a: 1, e: "Commanded torque, no rotation." },
      { q: "Soft-start / pre-charge limits:", o: ["Torque", "Inrush current to the DC bus", "theta", "Switching frequency"], a: 1, e: "Controls bus charging." },
      { q: "A watchdog in the drive ensures:", o: ["Faster PWM", "Recovery if firmware hangs", "Higher Vdc", "Lower THD"], a: 1, e: "Resets on lock-up." },
      { q: "Emergency stop should:", o: ["Be slow", "Immediately bring the motor to a safe state", "Increase speed", "Be optional"], a: 1, e: "Immediate safe halt." },
      { q: "The typical startup sequence is:", o: ["Run then align", "Init, calibrate, align, ramp, closed-loop", "Closed-loop first", "Random"], a: 1, e: "Ordered safe bring-up." },
      { q: "Reverse rotation at startup is prevented by:", o: ["Ignoring theta", "Proper alignment and ramp direction", "Higher Vdc", "No PWM"], a: 1, e: "Correct initial alignment." },
      { q: "Brake (active short) vs coast (disable) differ in:", o: ["Color", "Whether the motor is shorted to decelerate or freewheels", "Vref", "theta"], a: 1, e: "Stopping behaviour on shutdown." },
    ],
  ],
};
const expandMcq = (mods, sets) => { const o = {}; mods.forEach((m, i) => { o[m.id] = (sets[i] || []).map((x) => ({ id: uid(), q: x.q, options: x.o, answer: x.a, explain: x.e })); }); return o; };
const GATEKEEPER_FW = `/* ============================================================
   CAEE LAB GATEKEEPER FIRMWARE  (reference template — STM32G4)
   Owns all protection peripherals. Student logic runs ONLY inside
   student_control_step() and can never disable these safeguards.
   Edit freely from the admin "Lab security" panel.
   ============================================================ */
#include "stm32g4xx_hal.h"
#include <stdint.h>

/* ---- configurable safety limits ---- */
#define PWM_PERIOD        4250u     /* TIM1 ARR (e.g. 20 kHz)      */
#define DEADTIME_NS       1000u     /* enforced dead-time          */
#define DUTY_MAX_PCT      85u       /* hard ceiling on PWM duty    */
#define OVERCURRENT_ADC   3500u     /* raw ADC trip threshold      */
#define WATCHDOG_MS       50u       /* student step must refresh   */

/* reserved pins the student must never reconfigure (power stage) */
static const uint16_t RESERVED_PINS = GPIO_PIN_8|GPIO_PIN_9|GPIO_PIN_10|GPIO_PIN_13|GPIO_PIN_14|GPIO_PIN_15;

extern TIM_HandleTypeDef htim1;     /* advanced timer, 3-phase     */
extern ADC_HandleTypeDef hadc1;     /* phase-current sense         */
extern IWDG_HandleTypeDef hiwdg;    /* independent watchdog        */

static volatile uint8_t g_fault = 0;
static volatile uint8_t g_armed = 0;

/* ---- duty is clamped here; student NEVER writes CCR directly ---- */
static void safe_set_duty(uint8_t ch, uint16_t duty) {
    uint16_t cap = (uint16_t)((PWM_PERIOD * DUTY_MAX_PCT) / 100u);
    if (duty > cap) duty = cap;
    switch (ch) {
        case 0: __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_1, duty); break;
        case 1: __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_2, duty); break;
        case 2: __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_3, duty); break;
    }
}

/* ---- hardware over-current break: latched, cannot be cleared by code ---- */
void HAL_TIMEx_BreakCallback(TIM_HandleTypeDef *htim) {
    g_fault = 1;                      /* MOE already cleared by hw  */
    __HAL_TIM_MOE_DISABLE(&htim1);
}

static void shutdown(void) {
    g_armed = 0; g_fault = 1;
    __HAL_TIM_MOE_DISABLE(&htim1);    /* all outputs Hi-Z           */
}

/* ---- enforce dead-time + break every loop (defensive) ---- */
static void enforce_protection(void) {
    /* re-assert dead-time and break enable in case anything changed */
    TIM1->BDTR |= TIM_BDTR_BKE | TIM_BDTR_AOE_Msk * 0; /* keep break on */
    if ((TIM1->BDTR & 0xFF) == 0) shutdown();          /* DTG=0 => unsafe */
    /* over-current check */
    HAL_ADC_Start(&hadc1);
    if (HAL_ADC_PollForConversion(&hadc1, 1) == HAL_OK) {
        if (HAL_ADC_GetValue(&hadc1) > OVERCURRENT_ADC) shutdown();
    }
}

/* =====================================================================
   STUDENT HOOK — the only place student code runs.
   Inputs: measured currents/sensors (read-only). Output: duty via
   safe_set_duty(). Must return quickly and refresh nothing else.
   ===================================================================== */
void student_control_step(const uint16_t adc[3]) {
    /* ---- student-supplied control goes here ----
       e.g. simple open-loop ramp:
       static uint16_t d = 0; d += 1; if (d > 800) d = 0;
       safe_set_duty(0, d); safe_set_duty(1, d); safe_set_duty(2, d);
    */
}

int main(void) {
    HAL_Init();
    /* SystemClock_Config(); MX_GPIO/TIM1/ADC1/IWDG init from CubeMX */
    /* CubeMX must set: TIM1 BDTR dead-time = DEADTIME_NS, break input
       (BKIN) enabled and mapped to the driver fault/over-current line. */

    g_armed = 0;
    uint16_t adc[3] = {0,0,0};

    /* ---- safe-start: outputs stay Hi-Z until interlock confirms ---- */
    while (!g_armed) {
        if (/* operator enable interlock */ HAL_GPIO_ReadPin(GPIOC, GPIO_PIN_13) == GPIO_PIN_RESET)
            g_armed = 1;
        HAL_IWDG_Refresh(&hiwdg);
    }
    __HAL_TIM_MOE_ENABLE(&htim1);
    HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);

    while (1) {
        enforce_protection();
        if (g_fault) { shutdown(); continue; }   /* latched until reset */
        /* adc[] = latest phase-current samples (filled by ADC/DMA) */
        student_control_step(adc);
        HAL_IWDG_Refresh(&hiwdg);                 /* runaway protection */
    }
}
`;
function seed() {
  const q = (title, prompt, expected = "") => ({ id: uid(), title, video: "", pdfName: "", c: { prompt, expected, resources: "" }, hw: { prompt: "Paste the firmware C code you flashed and ran on your STM32 board for this module. Optional — does not affect module completion.", resources: "" } });
  const p = (title, desc, submit) => ({ id: uid(), title, desc, submit, resources: "" });
  const mc = (q, options, answer, explain) => ({ id: uid(), q, options, answer, explain });
  const shuf = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const mq4 = (q, correct, distractors, explain = "") => { const options = shuf([correct, ...distractors]); return { id: uid(), q, options, answer: options.indexOf(correct), explain }; };
  const bq = [
    q("Module 0 · Introduction to STM32 software and hardware", "Orientation videos: toolchain setup, board overview and how this course works. No coding challenge — add one or more videos below."),
    q("C1: C Values, Functions and Checked Arithmetic", "Write and reason about C values, functions and arithmetic that fails safely instead of silently overflowing."),
    q("C2: Bits, Arrays, Pointers and Structures", "Manipulate bits, arrays, pointers and structures the way embedded C code actually uses them."),
    q("C3: State, Scope and Reproducible Debugging", "Reason about state and scope, and debug a failure so it reproduces the same way every time."),
    q("BF: B.Tech Foundation Bridge — Bytes and Rollover", "Bridge from general C into byte-level, rollover-aware thinking before the CAN/CAN-FD track begins."),
    q("B1: Embedded C Kernel and ECU Architecture", "Execute a deterministic cyclic task and prove deadline handling."),
    q("B2: CAN/CAN-FD Physical Layer and Two-Node Rig", "Wire two valid CAN-FD nodes and diagnose termination and standby faults."),
    q("B3: CAN Frame, Arbitration, CRC and Fault Confinement", "Predict the arbitration winner and explain ACK, CRC, stuffing and error states."),
    q("B4: FDCAN Timing and CAN-FD Phases", "Calculate a valid nominal bit rate and sample point before configuring STM32 FDCAN."),
    q("B5: Signal Encoding, Counters, CRC and Scheduling", "Pack physical values into a stable interface and detect stale or corrupted data."),
    q("B6: Receiver Validation and Safe-State Machine", "Reject invalid frames, qualify faults and command deterministic degraded/safe outputs."),
  ];
  const mq = [
    q("Module 0 · Introduction to STM32 software and hardware", "Orientation videos: toolchain setup, board overview and how this course works. No coding challenge — add one or more videos below."),
    q("C1: C Values, Functions and Checked Arithmetic", "Write and reason about C values, functions and arithmetic that fails safely instead of silently overflowing."),
    q("C2: Bits, Arrays, Pointers and Structures", "Manipulate bits, arrays, pointers and structures the way embedded C code actually uses them."),
    q("C3: State, Scope and Reproducible Debugging", "Reason about state and scope, and debug a failure so it reproduces the same way every time."),
    q("MF: M.Tech Foundation Bridge — Units and Sampled Dynamics", "Bridge from general C into units-aware, sampled-time thinking before the PMSM FOC track begins."),
    q("M1: PMSM, Inverter and Motor-Model Foundations", "Relate three-phase voltage, rotor angle, torque and speed in a low-voltage PMSM model."),
    q("M2: Current Sensing, ADC Calibration and PWM Synchronization", "Convert ADC counts to amperes and sample away from switching edges."),
    q("M3: Clarke and Park Transforms", "Transform phase currents into stationary alpha-beta and rotating d-q quantities, then reconstruct them."),
    q("M4: Discrete PI Current Control, Limits and Anti-Windup", "Regulate id/iq without integrator runaway when the inverter voltage saturates."),
    q("M5: SVPWM and the Fast Control Loop", "Convert alpha-beta voltage into three legal duty cycles and execute the current loop on deadline."),
    q("M6: Sensored Startup and Nested Speed Control", "Align electrical zero, close the current loop first, then safely enable the slower speed loop."),
    q("M7: PMSM Digital Twin, Protection and Verification", "Run reproducible speed/load/fault experiments and report quantitative evidence."),
  ];
  const bp = [
    p("Simulated Sensor Node (Host)", "Build the full telemetry pipeline on the host and pass the auto-grader.", "Source + grader output log"),
    p("Live Sensor Acquisition (STM32 Nucleo)", "Bring up one real automotive sensor and stream readings over UART.", "Firmware + serial log"),
    p("Multi-Sensor Fusion + CAN Bus", "Fuse speed, throttle and IMU and broadcast a combined CAN telemetry frame.", "Firmware + CAN trace"),
    p("Capstone — Smart Sensor Node ECU", "Full FreeRTOS multitask node with CAN telemetry and fault handling.", "Repo + report"),
  ];
  const mp = [
    p("FOC Simulation Walk-through (Host)", "Verify Clarke/Park/SVPWM and the current & speed loops in simulation against the reference graphs.", "Source + verification graphs"),
    p("First Motor Spin (B-G431B-ESC1)", "Safe bring-up and a controlled open-loop spin via ST's Motor Control Workbench.", "Firmware + serial log"),
    p("Closed-Loop Current Control", "Close the current loop with measured phase currents and tune the PI gains.", "Firmware + plots"),
    p("Capstone — Fully Sensorless Drive", "Sensorless start-up and closed-loop speed-controlled drive with protection.", "Repo + report"),
  ];
  const mcqB = {}; bq.forEach((m) => { mcqB[m.id] = []; });
  mcqB[bq[0].id] = [
    mc("Which operation clears bit n of a register without affecting other bits?", ["x | (1 << n)", "x & ~(1 << n)", "x ^ (1 << n)", "x << n"], 1, "AND with the inverted mask clears only bit n."),
    mc("For an 8-bit value, what is 0xFF & ~(1 << 7)?", ["0xFF", "0x7F", "0x80", "0x00"], 1, "Clearing bit 7 of 0xFF leaves 0x7F."),
    mc("Why use 'volatile' on a memory-mapped peripheral register pointer?", ["To make it faster", "To stop the compiler optimising away reads/writes", "To make it constant", "To allocate it on the heap"], 1, "volatile tells the compiler the value can change outside normal flow."),
  ];
  mcqB[bq[3].id] = [
    mc("CAN is best described as a…", ["Master-slave addressed bus", "Multi-master message-based broadcast bus", "Point-to-point UART link", "Star-topology Ethernet"], 1, "CAN is multi-master; frames carry message IDs, not node addresses."),
    mc("On the CAN bus, which logical level is 'dominant'?", ["Logical 1", "Logical 0", "Recessive", "High-impedance"], 1, "Logical 0 is dominant and overrides recessive 1."),
    mc("How is bus access arbitrated on CAN?", ["Time-division slots", "Token passing", "Non-destructive bitwise arbitration on the identifier", "Random backoff only"], 2, "Nodes arbitrate bit-by-bit; dominant bits win without destroying the message."),
    mc("Which identifier wins arbitration?", ["The highest numeric ID", "The lowest numeric ID", "The longest ID", "The newest node"], 1, "Lower ID = more dominant bits early = higher priority."),
    mc("A standard (CAN 2.0A) identifier is how many bits?", ["8", "11", "16", "29"], 1, "Standard ID = 11 bits; extended (2.0B) = 29 bits."),
    mc("Maximum data payload of a classic CAN data frame?", ["4 bytes", "8 bytes", "16 bytes", "64 bytes"], 1, "Classic CAN carries up to 8 data bytes; CAN FD up to 64."),
    mc("Bit stuffing inserts a complementary bit after how many identical consecutive bits?", ["3", "4", "5", "6"], 2, "After 5 identical bits a stuff bit of opposite polarity is inserted."),
    mc("CAN physical signalling uses…", ["Single-ended TTL", "Differential CAN_H / CAN_L", "Optical fibre", "Manchester on one wire"], 1, "CAN uses differential signalling for noise immunity."),
    mc("Correct high-speed CAN bus termination is…", ["60 Ω in the middle", "120 Ω at each end", "330 Ω pull-ups", "No termination"], 1, "A 120 Ω resistor at each end matches the line impedance."),
    mc("In the ACK slot, a correctly receiving node…", ["Stays recessive", "Drives a dominant bit", "Sends its ID", "Resets the bus"], 1, "Receivers assert dominant in the ACK slot to acknowledge."),
    mc("The CRC field in a CAN frame provides…", ["Encryption", "Error detection", "Addressing", "Flow control"], 1, "CRC detects transmission errors."),
    mc("An active error flag consists of…", ["6 dominant bits", "2 recessive bits", "11 recessive bits", "1 dominant bit"], 0, "An active error flag is 6 dominant bits."),
    mc("A node goes 'bus-off' when…", ["REC > 127", "TEC > 255", "Any single error", "Power-up"], 1, "Transmit Error Counter exceeding 255 forces bus-off."),
    mc("Which is NOT a CAN frame type?", ["Data frame", "Remote frame", "Error frame", "Address frame"], 3, "CAN has data, remote, error and overload frames — no address frame."),
    mc("A remote frame is used to…", ["Send data", "Request data from another node", "Reset the bus", "Acknowledge"], 1, "A remote frame (RTR recessive) requests transmission of a message."),
    mc("Maximum bit rate of classic high-speed CAN?", ["125 kbit/s", "500 kbit/s", "1 Mbit/s", "10 Mbit/s"], 2, "Classic high-speed CAN tops out at 1 Mbit/s."),
    mc("CAN FD primarily improves…", ["Number of nodes", "Payload size and data-phase bit rate", "Wire length", "Voltage levels"], 1, "CAN FD allows up to 64 data bytes and a faster data phase."),
    mc("The sample point in CAN bit timing is…", ["Where the bit is driven", "Where the bit value is read", "The SOF bit", "The CRC delimiter"], 1, "The controller samples the bus level at the sample point within the bit."),
    mc("CAN nodes are addressed by…", ["A unique node address", "Message identifiers, not node addresses", "MAC addresses", "IP addresses"], 1, "CAN is message-oriented; IDs identify content/priority, not nodes."),
    mc("The Start-of-Frame (SOF) bit is…", ["Recessive", "Dominant", "A stuff bit", "Optional"], 1, "SOF is a single dominant bit marking the start of a frame."),
  ];
  const mcqM = {}; mq.forEach((m) => { mcqM[m.id] = []; });
  mcqM[mq[0].id] = [
    mc("PMSM stands for…", ["Pulse-Modulated Servo Motor", "Permanent Magnet Synchronous Motor", "Programmable Motor", "Phase-Modulated Stepper Motor"], 1, "PMSM = Permanent Magnet Synchronous Motor."),
    mc("Field-Oriented Control decouples stator current into…", ["Speed and torque", "d-axis (flux) and q-axis (torque) components", "Voltage and frequency", "Phase A and B"], 1, "FOC splits current into d (flux) and q (torque) axes."),
    mc("Which current component produces torque in a PMSM?", ["id", "iq", "i0", "ic"], 1, "q-axis current produces torque."),
    mc("For a surface-mounted PMSM, the d-axis current reference is usually…", ["Maximum", "Zero", "Equal to iq", "Negative bus current"], 1, "id*=0 gives maximum torque-per-amp for an SPMSM."),
    mc("The Clarke transform converts…", ["dq → abc", "abc → stationary αβ", "αβ → dq", "abc → dq directly"], 1, "Clarke: three-phase abc → stationary αβ."),
    mc("The Park transform converts…", ["abc → αβ", "αβ → rotating dq", "dq → abc", "abc → dq directly"], 1, "Park: αβ → rotating dq using rotor angle."),
    mc("What does the Park transform require?", ["Bus voltage", "Rotor electrical angle", "Switching frequency", "Phase resistance"], 1, "Park needs the rotor electrical angle θ."),
    mc("SVPWM is applied after which block?", ["Clarke", "Inverse Park", "Speed PI", "ADC"], 1, "Inverse Park produces Vα,Vβ which SVPWM then modulates."),
    mc("A key advantage of SVPWM over sinusoidal PWM is…", ["Simpler code", "~15% better DC-bus voltage utilisation", "No inverter needed", "Lower resolution"], 1, "SVPWM uses the DC bus about 15% more effectively."),
    mc("How many switching vectors does a 2-level 3-phase inverter have?", ["4", "6", "8 (6 active + 2 zero)", "12"], 2, "Eight states: six active and two zero vectors."),
    mc("Field weakening is achieved by…", ["Increasing iq", "Injecting negative id", "Raising bus voltage", "Lowering pole count"], 1, "Negative id weakens the flux to run above base speed."),
    mc("In a sensorless drive, rotor position is typically estimated from…", ["Hall sensors", "Back-EMF / flux observer", "An encoder", "Bus current only"], 1, "Sensorless FOC estimates angle from back-EMF/flux."),
    mc("Why is low-speed sensorless start difficult?", ["Too much torque", "Back-EMF is very small near zero speed", "PWM is off", "CAN is busy"], 1, "Back-EMF ∝ speed, so it is tiny at low speed — needs open-loop start or HFI."),
    mc("In cascaded FOC, which loop has the highest bandwidth?", ["Speed loop", "Position loop", "Current (inner) loop", "Temperature loop"], 2, "The inner current loop must be the fastest."),
    mc("Electrical speed relates to mechanical speed by…", ["They are equal", "× pole pairs", "÷ 3", "× stator resistance"], 1, "ω_elec = pole-pairs × ω_mech."),
    mc("PI controllers in FOC need anti-windup because…", ["Of CAN errors", "The output saturates at the bus-voltage limit", "Of bit stuffing", "The encoder drifts"], 1, "When the actuator saturates, the integrator must stop winding up."),
    mc("Which is a common rotor-angle estimator?", ["FFT", "Sliding-mode observer / PLL", "CRC check", "Bit stuffer"], 1, "SMO and PLL-based estimators recover angle and speed."),
    mc("In steady state, dq-frame currents appear as…", ["Sinusoids", "DC values", "Square waves", "Random noise"], 1, "In the rotating dq frame, steady-state currents are DC."),
    mc("Phase current is commonly sensed using…", ["A tachometer", "Shunt resistors / current sensors", "A thermistor", "The CAN bus"], 1, "Low-side or inline shunts (or Hall current sensors) measure phase current."),
    mc("A major source of torque ripple is…", ["High bus voltage", "Cogging, inverter dead-time and current-measurement error", "Using the dq frame", "Anti-windup"], 1, "Cogging, dead-time and sensing errors cause torque ripple."),
  ];
  const resume = [
    { id: uid(), title: "Resume — one page, results first", body: "Keep it to one page. Lead with a 2-line summary naming your target role (e.g. Embedded Firmware Engineer). List projects before coursework, each as: what you built, the tech (STM32, FreeRTOS, CAN, C), and the measurable result." },
    { id: uid(), title: "Show the CAEE projects as real work", body: "Describe your Smart Sensor Node / FOC drive like an engineer would: 'Built a FreeRTOS multitask CAN telemetry node on STM32; fused Hall-speed, dual-track throttle and IMU into an 8-byte frame.' Link your repo and the verifiable CAEE certificate ID." },
    { id: uid(), title: "Skills section that passes ATS", body: "Group skills: Languages (Embedded C), RTOS (FreeRTOS), Protocols (CAN, I2C, SPI, UART), MCUs (STM32), Tools (STM32CubeIDE, Git, oscilloscope/logic analyser). Use the exact keywords from the job post." },
    { id: uid(), title: "LinkedIn — make recruiters find you", body: "Headline: 'Embedded Systems | STM32 · FreeRTOS · CAN · Motor Control'. Add the CAEE projects to Featured with a demo. Turn on 'Open to work' for embedded/firmware roles in your cities, and request a recommendation from your CAEE mentor." },
    { id: uid(), title: "Before you apply — checklist", body: "PDF named Firstname_Lastname_Embedded.pdf · no typos · GitHub link works · each project has a one-line impact · LinkedIn matches resume · contact details correct." },
  ];
  const career = {
    roadmap: [
      { id: uid(), step: "Finish the build track", desc: "Pass all modules and the 4 projects so you have shipped, gradeable work to talk about." },
      { id: uid(), step: "Master the interview bank", desc: "Score 80%+ on the interview MCQs for every module before you start applying." },
      { id: uid(), step: "Polish resume & LinkedIn", desc: "Use the Resume & LinkedIn section; get your mentor to review once." },
      { id: uid(), step: "Apply & track", desc: "Target embedded/firmware/VLSI roles; apply to 5–10 a week and track responses." },
      { id: uid(), step: "Mock interviews", desc: "Practise explaining your projects out loud and whiteboarding C and peripheral questions." },
    ],
    resources: [
      { id: uid(), title: "STM32 reference manuals (ST)", url: "https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html", note: "Datasheets & reference manuals for your MCU." },
      { id: uid(), title: "FreeRTOS documentation", url: "https://www.freertos.org/Documentation/RTOS_book.html", note: "Tasks, queues, scheduling fundamentals." },
      { id: uid(), title: "ST Motor Control Workbench", url: "https://www.st.com/en/embedded-software/x-cube-mcsdk.html", note: "FOC motor-control SDK (M.Tech track)." },
      { id: uid(), title: "CAN bus basics", url: "https://www.csselectronics.com/pages/can-bus-simple-intro-tutorial", note: "Practical CAN protocol introduction." },
    ],
  };
  return {
    site: {
      heroTag: "Where engineers build real automotive-grade firmware — not slideware.",
      about: "CAEE is a hands-on engineering centre focused on automotive embedded systems. Our interns ship industry-grade firmware on real STM32 hardware: FreeRTOS, CAN telemetry, automotive sensor interfacing, and sensorless field-oriented motor control. Every submission is reviewed by practicing engineers — so what you build is what employers actually want.",
      stats: [{ k: "12", v: "Verified code modules" }, { k: "2", v: "Project tracks" }, { k: "4", v: "Hands-on projects each" }, { k: "100%", v: "Mentor reviewed" }],
      showcase: [
        { title: "Smart Sensor Node", tag: "FreeRTOS + CAN on STM32 Nucleo", desc: "An intern's multitask CAN telemetry node running on real hardware.", img: "", video: "" },
        { title: "Sensorless FOC Drive", tag: "FOC on B-G431B-ESC1", desc: "Closed-loop sensorless motor spin built from scratch.", img: "", video: "" },
        { title: "Automotive Sensor Suite", tag: "Hall · throttle ADC · MPU6050", desc: "Real automotive sensors interfaced and fused.", img: "", video: "" },
      ],
      videoUrl: "", whatsapp: "919999999999",
      mentor: { name: "Purushotham", role: "Staff Engineer & Lead Mentor", photo: "", email: "purushotham@anadiwave.com", phone: "+91 99451 48568" },
      steps: [
        { id: uid(), title: "Register", desc: "Create your account and choose your track." },
        { id: uid(), title: "Submit details & resume", desc: "Share your resume and academic marks." },
        { id: uid(), title: "Screening test", desc: "Attend a short screening to confirm fit." },
        { id: uid(), title: "Payment", desc: "Confirm your seat via secure payment." },
        { id: uid(), title: "Training & internship", desc: "Build 6 modules and 4 projects with mentor feedback." },
        { id: uid(), title: "Certification", desc: "Pass everything and download your verifiable certificate." },
      ],
      pricing: { btech: { mrp: 16000, price: 6000, period: "6 months" }, mtech: { mrp: 18000, price: 7000, period: "6 months" } },
      registration: { open: true, nextDate: "", note: "", minCgpa: "", payBtech: "", payMtech: "" },
      labs: { compile: "", btech: "", mtech: "" },
      trackIntro: {
        btech: { desc: "Welcome to the Smart Sensor Node track. Watch the intro, then work through the 6 modules and 4 projects below.", image: "", video: "" },
        mtech: { desc: "Welcome to the Sensorless FOC track. Watch the intro, then work through the 6 modules and 4 projects below.", image: "", video: "" },
      },
      posts: [
        { id: uid(), title: "New B.Tech batch starts this month", date: TODAY(), image: "", body: "Our automotive Smart Sensor Node track is now open for the new cohort. 6 hands-on modules with video lessons, real STM32 hardware — auto-checked live in the Virtual Lab — and mentor-reviewed projects." },
        { id: uid(), title: "CAEE interns ship a sensorless motor drive", date: TODAY(), image: "", body: "M.Tech interns took a BLDC motor from open-loop spin to fully sensorless closed-loop control on the B-G431B-ESC1 — built from their own observer code." },
      ],
      projectBank: { btech: [], mtech: [] },
      security: {
        note: "These rules screen student hardware/firmware code before it can reach the lab PC. Edit, add or remove rules anytime — changes apply immediately to new submissions. Each rule is a regular expression with a severity and a message. Anything medium/high holds the code for manual review and is never auto-forwarded.",
        rules: [
          { id: uid(), pattern: "\\b(fork|vfork)\\s*\\(", flags: "", msg: "Process creation (fork)", risk: "medium" },
          { id: uid(), pattern: "\\b(unlink|remove|rmdir)\\s*\\(", flags: "", msg: "Deletes files on the host", risk: "high" },
          { id: uid(), pattern: "\\bgethostbyname\\b|\\bsendto?\\s*\\(|\\brecv(from)?\\s*\\(", flags: "", msg: "Network send/receive", risk: "high" },
          { id: uid(), pattern: "https?://|\\bwget\\b|\\bcurl\\b", flags: "i", msg: "Embedded URL / network download", risk: "medium" },
          { id: uid(), pattern: "#include\\s*<windows\\.h>|WinExec|ShellExecute|CreateProcess|RegSetValue|RegCreateKey", flags: "i", msg: "Windows host API / registry access", risk: "high" },
          { id: uid(), pattern: "\\bptrace\\s*\\(|/dev/mem|/proc/self|/etc/(passwd|shadow)", flags: "", msg: "Low-level OS / sensitive path access", risk: "high" },
          { id: uid(), pattern: "(\\\\x[0-9a-fA-F]{2}){8,}", flags: "", msg: "Long hex byte sequence (possible shellcode)", risk: "high" },
          { id: uid(), pattern: "[A-Za-z0-9+/]{160,}={0,2}", flags: "", msg: "Large encoded blob (possible hidden payload)", risk: "medium" },
          { id: uid(), pattern: "while\\s*\\(\\s*1\\s*\\)[^;{]*\\bfork\\b", flags: "", msg: "Possible fork bomb", risk: "high" },
          { id: uid(), pattern: "\\bmmap\\s*\\([^)]*PROT_EXEC", flags: "", msg: "Executable memory mapping", risk: "high" },
          { id: uid(), pattern: "->BDTR|\\bBDTR\\b|MOE_DISABLE|MOE\\b", flags: "", msg: "Touches timer break/dead-time/MOE register (shoot-through risk)", risk: "high" },
          { id: uid(), pattern: "dead[_-]?time\\s*=\\s*0|\\bDTG\\s*=\\s*0", flags: "i", msg: "Sets dead-time to zero (shoot-through risk)", risk: "high" },
          { id: uid(), pattern: "->CCER|CC[1-6]NE", flags: "", msg: "Drives complementary PWM outputs directly (verify dead-time)", risk: "medium" },
          { id: uid(), pattern: "OPTKEYR|FLASH_OPTR|\\bRDP\\b|read.?out\\s*protection|option\\s*byte", flags: "i", msg: "Modifies option bytes / read-out protection (can permanently brick the MCU)", risk: "high" },
          { id: uid(), pattern: "FLASH_Erase|HAL_FLASH_Program|->CR[^;]*\\bPER\\b|->CR[^;]*\\bMER\\b", flags: "", msg: "Erases / programs flash (wear or brick risk)", risk: "medium" },
          { id: uid(), pattern: "IWDG[^;]*(stop|disable)|WWDG[^;]*disable", flags: "i", msg: "Disables the watchdog (no runaway protection)", risk: "medium" },
          { id: uid(), pattern: "duty\\s*=\\s*100|CCR[1-6]?\\s*=\\s*(ARR|0xffff|65535)", flags: "i", msg: "Forces 100% PWM duty (stall / over-current risk)", risk: "medium" },
          { id: uid(), pattern: "BKIN|\\bBKE\\b|break[^;]*disable", flags: "i", msg: "Touches the brake / over-current input (must stay enabled)", risk: "high" },
        ],
        gatekeeper: GATEKEEPER_FW,
      },
      mcq: { btech: mcqB, mtech: mcqM },
      resume,
      career,
      workshop: {
        open: true,
        deadline: "",
        finalCount: 20,
        passPct: 70,
        btech: {
          title: "Read a Sensor, Send it on CAN",
          intro: "A free, self-paced workshop in modules. Each module has a recorded video, downloadable PDF notes and a 10-question quiz. Finish the modules, then pass the final assessment to earn your certificate.",
          packs: [
            { id: uid(), title: "Module 1 — Why automotive embedded + the ECU chain", videoUrl: "", pdfName: "", note: "How a car's electronics work: sensor to microcontroller to CAN to actuator.", mcq: [
              mq4("In a closed-loop ECU, what is the correct order of the signal chain?", "Sensor → ECU → actuator", ["Actuator → ECU → sensor", "ECU → sensor → actuator", "Sensor → actuator → ECU"], "The ECU reads a sensor, decides, then drives an actuator."),
              mq4("Which property most distinguishes ECU firmware from a desktop app?", "Hard real-time deadlines and determinism", ["A graphical user interface", "Effectively unlimited memory", "It runs on a general-purpose OS"], "ECUs must respond within fixed deadlines, every cycle."),
              mq4("Why is CAN preferred over point-to-point wiring among many ECUs?", "Fewer wires with multi-master messaging", ["It is wireless", "It needs no common ground", "It carries video"], "One shared bus replaces a harness of dedicated wires."),
              mq4("A 'drive-by-wire' throttle replaces the mechanical cable with…", "Sensors, an ECU and an actuator", ["A larger return spring", "A hydraulic line", "A second pedal"], "Pedal position is sensed, processed, and the throttle actuated electronically."),
              mq4("What does 'deterministic' mean for embedded firmware?", "Same inputs give the same timing and behaviour every time", ["It always runs as fast as possible", "Timing is random", "It uses a determinism library"], "Predictable timing is essential for control loops."),
              mq4("A watchdog timer is used in an ECU to…", "Reset the MCU if the firmware hangs", ["Speed up the CPU", "Increase CAN baud rate", "Save power only"], "If the code stops kicking it, the watchdog forces a reset."),
              mq4("ISO 26262 (functional safety) is primarily concerned with…", "Reducing the risk of hazardous failures", ["Fuel economy", "Infotainment UI", "Cabin comfort"], "It is the automotive functional-safety standard."),
              mq4("A 'plausibility check' on a sensor means…", "Cross-checking redundant signals for consistency", ["Trusting a single reading", "Averaging over an hour", "Ignoring faults"], "Redundant signals are compared to catch faults."),
              mq4("Within a sensor node, the microcontroller's main job is to…", "Acquire, process and communicate sensor data", ["Generate electrical power", "Cool the engine", "Store media files"], "It is the compute + comms element of the node."),
              mq4("Why are fixed-point or carefully-bounded computations common in ECUs?", "Predictable timing and no surprise floating-point cost", ["They look nicer", "C forbids floats", "To use more RAM"], "Determinism and limited resources favour bounded math."),
            ] },
            { id: uid(), title: "Module 2 — Embedded C: registers & bit operations", videoUrl: "", pdfName: "", note: "Setting, clearing and testing bits to control hardware.", mcq: [
              mq4("To SET bit 3 of REG without disturbing the others:", "REG |= (1 << 3);", ["REG &= (1 << 3);", "REG ^= 3;", "REG = 3;"], "OR with the mask sets that bit."),
              mq4("To CLEAR bit 5 of REG:", "REG &= ~(1 << 5);", ["REG |= (1 << 5);", "REG ^= (1 << 5);", "REG = 5;"], "AND with the inverted mask clears that bit."),
              mq4("To TOGGLE bit 2 of REG:", "REG ^= (1 << 2);", ["REG |= (1 << 2);", "REG &= ~(1 << 2);", "REG = ~2;"], "XOR with the mask flips that bit."),
              mq4("To TEST whether bit 4 is set:", "if (REG & (1 << 4))", ["if (REG | (1 << 4))", "if (REG = (1 << 4))", "if (REG ^ 4)"], "AND isolates the bit; non-zero means set."),
              mq4("What is the value of 0xFF & ~(1 << 7)?", "0x7F", ["0xFF", "0x80", "0x00"], "Clearing bit 7 of 0xFF leaves 0x7F."),
              mq4("Why must a memory-mapped peripheral register be declared volatile?", "It stops the compiler caching or optimising away accesses", ["It makes access faster", "It encrypts the value", "It saves RAM"], "Hardware can change it at any time, so every access must be real."),
              mq4("The correct pointer to a 32-bit register at 0x40020000 is:", "volatile uint32_t *p = (volatile uint32_t*)0x40020000;", ["int *p = 0x40020000;", "char p = 0x40020000;", "#define p 0x40020000 (only)"], "A volatile uint32_t pointer of the right width and qualifier."),
              mq4("To write 0x5 into the 3-bit field at bits [3:1] without disturbing others:", "REG = (REG & ~(0x7 << 1)) | (0x5 << 1);", ["REG |= (0x5 << 1);", "REG &= (0x5 << 1);", "REG ^= 0x5;"], "Clear the field with its mask, then OR in the shifted value."),
              mq4("What is (1 << 0) | (1 << 4)?", "0x11", ["0x10", "0x05", "0x21"], "1 + 16 = 17 = 0x11."),
              mq4("A naive read-modify-write on a hardware register can be buggy because…", "Hardware may change the register between the read and the write", ["C cannot do bit math", "volatile is illegal", "Registers don't exist"], "This is the read-modify-write hazard on shared/hardware state."),
            ] },
            { id: uid(), title: "Module 3 — Reading the throttle (ADC to %)", videoUrl: "", pdfName: "", note: "Turn an analog voltage into 0-100% and run the dual-track plausibility check.", mcq: [
              mq4("How many discrete codes does a 12-bit ADC produce?", "4096", ["1024", "2048", "65536"], "2^12 = 4096 (values 0..4095)."),
              mq4("With Vref = 3.3 V and a 12-bit ADC, the volts-per-LSB is about…", "3.3 / 4095", ["3.3 / 255", "3.3 / 1023", "3.3 / 65535"], "Full scale spans 4095 steps."),
              mq4("A raw 12-bit reading of 2048 is approximately what % of full scale?", "50%", ["25%", "75%", "100%"], "2048/4095 ≈ 0.5."),
              mq4("Why do throttle pedals use two sensor tracks with different slopes?", "So a fault can be detected by cross-checking them", ["To double the output voltage", "To reduce cost", "Purely cosmetic"], "Disagreement beyond a threshold flags a fault."),
              mq4("The formula to convert a 12-bit raw count to percent is…", "pct = raw * 100 / 4095", ["pct = raw / 100", "pct = raw * 4095", "pct = raw - 100"], "Normalise to full scale, then scale to 100."),
              mq4("A fast-changing analog source feeding a high-impedance ADC input should be…", "Buffered (e.g., an op-amp) before the ADC", ["Left floating", "Tied to 5 V", "Fed through 1 MΩ"], "A low-impedance buffer charges the sample capacitor properly."),
              mq4("Oversampling and averaging ADC samples mainly improves…", "Effective resolution and noise rejection", ["Conversion speed", "Input range", "Reference voltage"], "Averaging trades speed for cleaner, finer readings."),
              mq4("If the two TPS tracks disagree beyond the threshold, a safe ECU should…", "Enter a limp / fault state", ["Pick the higher value", "Ignore both", "Reboot every loop"], "Fail safe rather than act on a bad reading."),
              mq4("ADC sampling time must be long enough to…", "Charge the internal sample-and-hold capacitor", ["Cool the chip", "Raise Vref", "Reduce the bit depth"], "Too-short sampling gives gain/settling errors."),
              mq4("A throttle reading that jitters by ±1–2 LSB is best first addressed by…", "Filtering / averaging the samples", ["Increasing Vref", "Lowering resolution", "Removing the ground"], "Light filtering removes LSB noise."),
            ] },
            { id: uid(), title: "Module 4 — Measuring speed (timers / input-capture)", videoUrl: "", pdfName: "", note: "From Hall-sensor pulses to RPM.", mcq: [
              mq4("Input-capture mode records…", "The timer count at the instant of an input edge", ["The ADC value", "The PWM duty", "A UART byte"], "It timestamps edges in hardware."),
              mq4("A timer ticks at 1 MHz and measures 2000 counts between two pulses. The pulse frequency is…", "500 Hz", ["2 kHz", "1 kHz", "250 Hz"], "2000 ticks = 2 ms period → 500 Hz."),
              mq4("With P pulses per revolution and frequency f (Hz), RPM equals…", "(f / P) × 60", ["f × P × 60", "f / (60 × P)", "f × 60"], "rev/s = f/P, then ×60 for per-minute."),
              mq4("Measuring the period (time between edges) beats counting pulses per window when…", "Speed is low (few pulses arrive)", ["Speed is very high", "Only for PWM", "Never"], "At low speed, period gives far better resolution."),
              mq4("A timer's prescaler is used to…", "Divide the input clock to set the counting rate", ["Filter input noise", "Increase resolution without limit", "Set PWM duty only"], "PSC scales the clock feeding the counter."),
              mq4("For a 170 MHz timer clock, the prescaler value (divides by PSC+1) for a 1 MHz tick is…", "169", ["17", "1700", "85"], "170 MHz / 1 MHz = 170 → PSC + 1 = 170."),
              mq4("A long pulse period that exceeds the counter range must be handled by…", "Counting overflow interrupts and extending the value", ["Ignoring the overflow", "Resetting Vref", "Switching to the ADC"], "Track wraps so the measured period stays correct."),
              mq4("Capturing on both edges lets you additionally measure…", "Pulse width / duty cycle", ["Voltage", "Temperature", "Only frequency"], "Rising-to-falling spacing gives width."),
              mq4("A noisy Hall line causing spurious captures is best mitigated by…", "An input filter (timer digital filter) or Schmitt input", ["Removing the ground", "Lowering the clock to 1 Hz", "Raising RPM"], "Debounce/filter the edge before capture."),
              mq4("At very low RPM, period measurement gives ___ versus high RPM.", "Better resolution (longer period, more counts)", ["Worse resolution", "No reading at all", "Identical resolution"], "More ticks per period at low speed."),
            ] },
            { id: uid(), title: "Module 5 — The CAN bus", videoUrl: "", pdfName: "", note: "Frames, IDs, priority and arbitration.", mcq: [
              mq4("CAN bus arbitration priority is decided by…", "The message identifier (lower ID wins)", ["The node's address", "Random back-off", "Bus length"], "Lower numeric ID = higher priority, decided bit-by-bit."),
              mq4("On the CAN bus, a 'dominant' bit corresponds to logic…", "0 (it overrides recessive)", ["1 / recessive", "High-impedance", "Floating"], "Dominant (0) wins over recessive (1)."),
              mq4("A classic CAN data frame carries at most how many data bytes?", "8", ["4", "16", "64"], "Classic CAN payload is up to 8 bytes (CAN FD allows 64)."),
              mq4("Correct CAN bus termination is…", "120 Ω at each end of the bus", ["50 Ω at each end", "A 1 kΩ pull-up", "No termination needed"], "Two 120 Ω resistors match the cable impedance."),
              mq4("The STM32 integrates a CAN controller but a node still needs a…", "Transceiver such as SN65HVD230", ["Second ADC", "DAC", "External crystal for CAN"], "The transceiver drives the differential CANH/CANL lines."),
              mq4("CAN bit-stuffing inserts an opposite bit after how many identical bits?", "5", ["3", "8", "11"], "After 5 same-polarity bits a stuff bit is added."),
              mq4("When two nodes transmit together, the node sending recessive while another sends dominant will…", "Lose arbitration and back off", ["Win the bus", "Corrupt both frames", "Reset the bus"], "It detects the dominant bit and yields, without data loss."),
              mq4("CAN is fundamentally a ___ network.", "Multi-master, message-based", ["Strict master-slave", "Point-to-point", "Token ring"], "Any node may transmit; messages are addressed by ID."),
              mq4("The ACK slot of a CAN frame is driven by…", "Any receiver that validated the frame", ["The transmitter itself", "The terminator", "No node"], "Receivers assert ACK to confirm reception."),
              mq4("A node accumulating too many errors enters 'bus-off', meaning it…", "Stops participating until recovery", ["Transmits faster", "Becomes bus master", "Raises the baud rate"], "Error confinement removes a faulty node from the bus."),
            ] },
            { id: uid(), title: "Module 6 — Put it together: sensor → CAN", videoUrl: "", pdfName: "", note: "Packing readings into a telemetry frame.", mcq: [
              mq4("Packing a 16-bit RPM little-endian, data byte 0 should be…", "rpm & 0xFF", ["(rpm >> 8) & 0xFF", "rpm / 256", "rpm % 10"], "Little-endian puts the low byte first."),
              mq4("To send a throttle value 0–100 in the payload you need…", "1 byte (it fits in 0–255)", ["2 bytes", "4 bytes", "a float"], "A single unsigned byte suffices."),
              mq4("Using a fixed CAN ID per message type ensures…", "Consistent priority and easy receiver filtering", ["Random IDs", "Higher baud rate", "Bigger payloads"], "Receivers filter by ID; priority stays predictable."),
              mq4("Sending telemetry every 10 ms is a rate of…", "100 Hz", ["10 Hz", "1 kHz", "1 Hz"], "1 / 10 ms = 100 Hz."),
              mq4("A status/flags byte in the payload typically carries…", "Fault bits and state information", ["Padding only", "The CAN ID", "Bus termination"], "Compact health/state signalling."),
              mq4("Mapping a physical range (e.g. −40…215 °C) into 0…255 uses…", "An offset and a scale factor", ["Bit stuffing", "Random mapping", "Termination resistors"], "value = (phys − offset) / scale."),
              mq4("Two signals that must be sent at different rates are best handled by…", "Separate CAN IDs / messages", ["One overloaded frame", "A 9-byte frame", "Removing the ground"], "Different messages decouple the rates."),
              mq4("Receivers pick only the messages they need using…", "Acceptance filters on the ID", ["Longer cables", "A DAC", "Extra pull-ups"], "Hardware filters reduce CPU load."),
              mq4("A node that must react quickly to a command frame should…", "Use an RX interrupt / FIFO for that ID", ["Poll slowly in the main loop", "Disable CAN RX", "Ignore the command"], "Interrupt-driven RX gives low latency."),
              mq4("Sender and receiver must agree on endianness because otherwise…", "Multi-byte values are misinterpreted", ["The baud rate changes", "The bus is un-terminated", "Voltage changes"], "Byte order must match to reconstruct values."),
            ] },
          ],
        },
        mtech: {
          title: "How a Motor is Controlled (FOC)",
          intro: "A free, self-paced workshop in modules. Each module has a recorded video, downloadable PDF notes and a 10-question quiz. Finish the modules, then pass the final assessment to earn your certificate.",
          packs: [
            { id: uid(), title: "Module 1 — Why motor control + PMSM basics", videoUrl: "", pdfName: "", note: "Where FOC is used and why it beats simple control.", mcq: [
              mq4("PMSM stands for…", "Permanent Magnet Synchronous Motor", ["Pulse Modulated Servo Motor", "Programmable Multi-Stage Motor", "Phase Modulated Stator Motor"], "A synchronous AC motor with permanent magnets on the rotor."),
              mq4("In FOC, torque is controlled primarily through the…", "q-axis current", ["d-axis current", "DC-bus voltage", "PWM frequency"], "iq sets torque; id sets flux."),
              mq4("For a surface-mount PMSM, the d-axis current reference is usually…", "Zero (for maximum torque per amp)", ["Maximum", "Always negative rated", "Equal to iq"], "id* = 0 below base speed for SPMSM."),
              mq4("Compared to six-step/trapezoidal drive, FOC gives…", "Smoother torque and better efficiency", ["More torque ripple", "No need for PWM", "Cheaper sensors only"], "Continuous sinusoidal control reduces ripple."),
              mq4("A balanced three-phase stator winding produces a…", "Rotating magnetic field", ["Static field", "DC-only field", "Random field"], "Three phases create a rotating MMF."),
              mq4("Field weakening (commanding negative id) is used to…", "Run above base speed by reducing effective flux", ["Increase low-speed torque", "Cool the motor", "Improve the ADC"], "Negative d-current weakens flux to extend speed range."),
              mq4("For p pole-pairs, electrical angle relates to mechanical angle by…", "elec = p × mech", ["elec = mech", "elec = mech / p", "they are unrelated"], "Electrical angle advances p times per mechanical turn."),
              mq4("Rotor position is essential in FOC because it is used to…", "Align the current vector with the rotor (Park transform)", ["Set the CAN ID", "Provide the ADC reference", "Set PWM dead-time"], "θ rotates measurements into the dq frame."),
              mq4("The inverter driving a PMSM is typically a…", "Three-phase two-level bridge (six switches)", ["Single-phase half-bridge", "Buck converter", "Flyback converter"], "Six switches form three half-bridge legs."),
              mq4("Torque in a surface PMSM is essentially proportional to…", "The q-axis current", ["The d-axis current", "Bus voltage squared", "PWM period"], "T ∝ flux × iq."),
            ] },
            { id: uid(), title: "Module 2 — The core idea: d-q and the Clarke transform", videoUrl: "", pdfName: "", note: "Splitting current into flux and torque parts.", mcq: [
              mq4("The Clarke transform converts…", "abc (three-phase) → αβ (two-axis stationary)", ["dq → abc", "αβ → dq", "abc → dq directly"], "It collapses three phases into two orthogonal axes."),
              mq4("The simplified Clarke transform assumes…", "ia + ib + ic = 0 (balanced)", ["ia = ib", "ic = 0", "all phases equal"], "Balanced three-phase currents sum to zero."),
              mq4("With balanced currents, the α component equals…", "ia", ["ib", "ic", "ia + ib"], "α aligns with phase a."),
              mq4("The amplitude-invariant Clarke β component is…", "(ia + 2·ib) / √3", ["ia / √3", "ib × √3", "ic"], "Standard amplitude-invariant formula."),
              mq4("The αβ reference frame is…", "Stationary (fixed to the stator)", ["Rotating with the rotor", "DC", "Random"], "Clarke output is still stationary; Park makes it rotating."),
              mq4("In the αβ frame, balanced sinusoidal phase currents appear as…", "Two orthogonal sinusoids", ["Two DC values", "Square waves", "Constants"], "Still AC, but reduced to two axes."),
              mq4("The purpose of going abc → αβ → dq is to…", "Turn AC quantities into DC for simple PI control", ["Add noise", "Increase the phase count", "Avoid PWM"], "DC setpoints are easy to regulate."),
              mq4("Mathematically, the Clarke transform is…", "A linear (matrix) transform", ["Nonlinear", "Logarithmic", "Random"], "It is a constant matrix multiply."),
              mq4("Power-invariant and amplitude-invariant Clarke differ by a…", "Scaling factor (√(2/3) vs 2/3)", ["90° phase shift", "Sign change", "Frequency shift"], "Only the constant differs."),
              mq4("If only ia and ib are measured, ic is obtained as…", "ic = −(ia + ib)", ["ic = ia", "ic = ib − ia", "it cannot be found"], "From the balanced-sum assumption."),
            ] },
            { id: uid(), title: "Module 3 — The Park transform (rotor angle)", videoUrl: "", challenge: { starter: "#include <math.h>\n/* Given alpha and beta (from Module 2's Clarke transform), find the\n   current vector's magnitude and its angle in degrees (0-360). */\nint lab(const double in[8], double out[8]) {\n  (void)in; (void)out;\n  /* TODO: out[0] = magnitude, out[1] = angle in degrees */\n  return -1;\n}\n", harness: "#include <stdio.h>\nint main(void) {\n  unsigned failed=0;\n  { const double in[8]={3,4,0,0,0,0,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-5.0)<1e-6 && fabs(out[1]-53.13010235)<1e-3;\n    printf(\"%s magnitude345\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  { const double in[8]={1,0,0,0,0,0,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-1.0)<1e-6 && fabs(out[1]-0.0)<1e-3;\n    printf(\"%s alignedalpha\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  { const double in[8]={0,1,0,0,0,0,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-1.0)<1e-6 && fabs(out[1]-90.0)<1e-3;\n    printf(\"%s alignedbeta90\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  return failed?1:0;\n}\n" }, pdfName: "", note: "Rotating into the d-q frame.", mcq: [
              mq4("The Park transform converts…", "αβ (stationary) → dq (rotating)", ["abc → αβ", "dq → abc", "αβ → abc"], "It rotates the stationary frame by θ."),
              mq4("Park uses which quantity to rotate the frame?", "The rotor electrical angle θ", ["The DC-bus voltage", "The PWM duty", "Temperature"], "θ aligns dq with the rotor."),
              mq4("Given d = α·cosθ + β·sinθ, the q component is…", "q = −α·sinθ + β·cosθ", ["q = α·sinθ + β·cosθ", "q = α·cosθ − β·sinθ", "q = α + β"], "Standard rotation matrix."),
              mq4("In steady state with the correct θ, id and iq are…", "Constant (DC) values", ["Sinusoids", "Always zero", "Square waves"], "That is the whole point of dq control."),
              mq4("An error in the angle θ causes…", "Cross-coupling and torque error between d and q", ["Nothing", "Higher bus voltage", "CAN faults"], "Misalignment leaks torque into the wrong axis."),
              mq4("The inverse Park transform converts…", "dq → αβ using θ", ["αβ → abc", "abc → dq", "dq → abc directly"], "It rotates voltage commands back to the stationary frame."),
              mq4("The angle θ used by Park must be the ___ angle.", "Electrical", ["Mechanical", "PWM", "Bus"], "Electrical angle = pole-pairs × mechanical angle."),
              mq4("The Park transform is essentially a…", "Rotation matrix by θ", ["Scaling", "Integration", "Fourier transform"], "A 2×2 rotation."),
              mq4("If the rotor turns at electrical speed ω, θ is obtained by…", "Integrating ω over time (θ = ∫ω dt)", ["θ = ω²", "θ = ω / 2", "θ is constant"], "Angle is the integral of speed."),
              mq4("dq control is powerful because PI controllers then regulate…", "DC setpoints (id*, iq*)", ["AC signals", "PWM directly", "the angle only"], "Constant references are trivial for PI."),
            ] },
            { id: uid(), title: "Module 4 — Closing the loop: PI + anti-windup", videoUrl: "", challenge: { starter: "#include <math.h>\n/* in[0]=mechanical angle (deg), in[1]=pole pairs, in[2]=iq (A), in[3]=torque constant.\n   Compute electrical angle (Module 1: elec = pole_pairs x mech) and\n   estimated torque (Module 1: torque is proportional to iq). */\nint lab(const double in[8], double out[8]) {\n  (void)in; (void)out;\n  /* TODO: out[0] = electrical angle in degrees (wrapped to 0-360), out[1] = torque estimate */\n  return -1;\n}\n", harness: "#include <stdio.h>\nint main(void) {\n  unsigned failed=0;\n  { const double in[8]={90,7,0,0,0,0,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-270.0)<1e-6 && fabs(out[1]-0.0)<1e-6;\n    printf(\"%s sevenpolepairs\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  { const double in[8]={45,4,2.0,0.5,0,0,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-180.0)<1e-6 && fabs(out[1]-1.0)<1e-6;\n    printf(\"%s torqueest\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  { const double in[8]={200,2,0,0,0,0,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-40.0)<1e-6;\n    printf(\"%s wraparound\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  { const double in[8]={90,0,0,0,0,0,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==-1;\n    printf(\"%s invalidpolepairs\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  return failed?1:0;\n}\n" }, pdfName: "", note: "Driving currents to their targets safely.", mcq: [
              mq4("In a PI controller out = Kp·e + Ki·∫e, the integral term removes…", "Steady-state error", ["Measurement noise", "Transport delay", "Ripple only"], "Integration drives residual error to zero."),
              mq4("Integrator 'windup' occurs when…", "The output saturates but the integral keeps accumulating", ["the error is zero", "Kp = 0", "speed is high"], "The integral grows uselessly while clamped."),
              mq4("A standard anti-windup technique is to…", "Clamp / back-calculate the integral when saturated", ["Increase Ki", "Remove the PI", "Add more phases"], "Stop integrating once the output is limited."),
              mq4("A FOC current controller usually has…", "Two PI loops (d and q axes)", ["One PI total", "Five PI loops", "No PI"], "id and iq each have a PI."),
              mq4("The current loop bandwidth relative to the speed loop should be…", "Much higher (faster) than the speed loop", ["Lower than it", "Equal to it", "Zero"], "Inner loop must be the fastest."),
              mq4("Discretising the integral with sample time Ts is done as…", "integ += e · Ts", ["integ = e / Ts", "integ = e²", "integ = Kp"], "Rectangular integration accumulates e·Ts."),
              mq4("Too large a proportional gain Kp tends to cause…", "Oscillation / instability", ["A slow response", "Steady-state error", "No effect"], "Excess Kp reduces stability margin."),
              mq4("dq feed-forward decoupling cancels the…", "ω·L cross-coupling terms between d and q", ["PWM dead-time", "Bus voltage", "ADC noise"], "Removes speed-dependent coupling."),
              mq4("The PI output saturation limits correspond physically to…", "The available DC-bus voltage", ["The maximum ADC code", "The CAN payload size", "Motor temperature"], "You cannot command more than the bus can supply."),
              mq4("With proper anti-windup, on leaving saturation the loop…", "Recovers quickly without large overshoot", ["Overshoots badly", "Resets the MCU", "Stops"], "That is the benefit of anti-windup."),
            ] },
            { id: uid(), title: "Module 5 — Driving the phases: inverse Park + SVPWM", videoUrl: "", challenge: { starter: "#include <math.h>\n/* A basic proportional-integral (PI) controller.\n   in[0]=target, in[1]=actual, in[2]=Kp, in[3]=Ki, in[4]=integral so far, in[5]=dt. */\nint lab(const double in[8], double out[8]) {\n  (void)in; (void)out;\n  /* TODO: out[0] = error, out[1] = updated integral, out[2] = controller output */\n  return -1;\n}\n", harness: "#include <stdio.h>\nint main(void) {\n  unsigned failed=0;\n  { const double in[8]={5,2,1.0,0,0,0.01,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-3.0)<1e-6 && fabs(out[1]-0.03)<1e-6 && fabs(out[2]-3.0)<1e-6;\n    printf(\"%s proponly\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  { const double in[8]={5,5,1.0,2.0,1.0,0.01,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-0.0)<1e-6 && fabs(out[1]-1.0)<1e-6 && fabs(out[2]-2.0)<1e-6;\n    printf(\"%s zeroerrorintegralholds\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  { const double in[8]={10,0,0.5,0.1,2.0,0.1,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==0 && fabs(out[0]-10.0)<1e-6 && fabs(out[1]-3.0)<1e-6 && fabs(out[2]-5.3)<1e-6;\n    printf(\"%s combined\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  { const double in[8]={5,2,1.0,0,0,0,0,0}; double out[8]={0}; int rc=lab(in,out);\n    int ok = rc==-1;\n    printf(\"%s invaliddt\\n\", ok?\"PASS\":\"FAIL\"); if(!ok) failed++; }\n  return failed?1:0;\n}\n" }, pdfName: "", note: "Turning d-q voltages into three-phase duties.", mcq: [
              mq4("SVPWM stands for…", "Space Vector PWM", ["Single Voltage PWM", "Sine Variable PWM", "Switched Voltage PWM"], "Space-vector modulation of the inverter."),
              mq4("Compared with sinusoidal PWM, SVPWM gives about…", "15% higher DC-bus utilisation", ["Lower utilisation", "The same utilisation", "Zero output"], "SVPWM extends the linear modulation range."),
              mq4("A two-level three-phase inverter has how many switching vectors?", "8 (six active + two zero)", ["4", "3", "12"], "2³ switch combinations = 8 vectors."),
              mq4("The inverse Park output (Vα, Vβ) is fed into…", "The modulator (SVPWM) to compute the phase duties", ["The Clarke transform", "the ADC", "the CAN driver"], "It becomes the voltage command to modulate."),
              mq4("Dead-time between the high and low switches of a leg prevents…", "Shoot-through (both switches on, shorting the leg)", ["Low torque", "ADC error", "Integrator windup"], "A brief gap avoids a destructive short."),
              mq4("Dead-time also introduces ___ that may need compensation.", "Voltage distortion", ["Higher efficiency", "More bus voltage", "Lower current"], "It distorts the applied voltage, especially at low speed."),
              mq4("The zero vectors (000 and 111) are used in SVPWM to…", "Adjust/centre the duty without adding net voltage", ["Add torque", "Brake the motor", "Increase the CAN ID"], "They set the modulation depth and centring."),
              mq4("A typical PWM switching frequency for FOC is…", "About 10–20 kHz", ["50 Hz", "1 Hz", "1 MHz"], "High enough to be inaudible and smooth, not so high as to overheat."),
              mq4("Center-aligned PWM is preferred because it gives…", "Lower harmonic distortion and a clean current-sampling instant", ["Simpler code", "Higher bus voltage", "No dead-time"], "Its symmetry aids current sampling and EMI."),
              mq4("Phase current is best sampled…", "At the PWM midpoint (during a zero vector)", ["Randomly", "Right on a switching edge", "Never"], "Sampling at the centre avoids switching noise."),
            ] },
            
          ],
        },
      },
      courseDefaults: { btech: 180, mtech: 180 },
      testimonials: [
        { id: uid(), name: "Ananya R.", role: "B.Tech ECE → Embedded Intern", quote: "By week 6 I had a multitask CAN node on real STM32 hardware. The auto-grader made me actually fix my code." },
        { id: uid(), name: "Karthik S.", role: "M.Tech → FOC Intern", quote: "Spinning the motor closed-loop from my own observer code was the proudest moment of my degree." },
        { id: uid(), name: "Priya M.", role: "Final-year student", quote: "Mentor feedback on every submission set this apart. It felt like a real engineering team." },
      ],
      faq: [
        { id: uid(), q: "Do I need to own the hardware?", a: "Coding modules run in our online auto-grader. For hardware tasks you paste the firmware C you ran on your board; it's security-screened before a mentor reviews it." },
        { id: uid(), q: "Is the internship remote?", a: "Yes — it's a code-first remote internship with mentor feedback on each module." },
        { id: uid(), q: "I'm from CSE/EEE, not ECE. Can I join?", a: "Yes. Foundations start from C fundamentals." },
        { id: uid(), q: "Will I get a certificate?", a: "Yes — a verifiable CAEE certificate on passing all 6 modules and 4 projects." },
      ],
      team: [
        { id: uid(), name: "Mabi Nadaf", role: "Founder & Director" },
        { id: uid(), name: "Purushotham", role: "Staff Engineer & Lead Trainer · ex-TI, GlobalFoundries" },
        { id: uid(), name: "Vinod Kumar Jha", role: "Program Adviser" },
      ],
    },
    users: [
      { id: uid(), name: "Purushotham", email: "purushotham@caee.in", password: "Purushotham@CAEE2026", role: "superadmin" },
      { id: "demostu", name: "Demo Student", email: "demo@caee.in", password: "demo123", role: "student", track: "btech", access: true, college: "RV College of Engineering", year: "3rd year", phone: "+91 90000 00000", startDate: TODAY(), durationDays: 180 },
    ],
    questions: { btech: bq, mtech: mq },
    projects: { btech: bp, mtech: mp },
    submissions: {}, registrations: [], audit: [], issues: [], workshopRegs: [],
  };
}
async function load() { try { const r = await window.storage.get(KEY, true); if (r?.value) return JSON.parse(r.value); } catch (e) {} const f = seed(); try { await window.storage.set(KEY, JSON.stringify(f), true); } catch (e) {} return f; }
async function save(db) { try { await window.storage.set(KEY, JSON.stringify(db), true); } catch (e) {} }
const subKey = (u, t, id) => `${u}:${t}:${id}`;
const norm = (s) => (s || "").replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "").trim();
function daysLeft(u) { if (!u.startDate || !u.durationDays) return null; const e = new Date(u.startDate); e.setDate(e.getDate() + Number(u.durationDays)); return Math.ceil((e - new Date()) / 86400000); }
function elapsedDays(u) { if (!u.startDate) return null; return Math.max(0, Math.floor((new Date() - new Date(u.startDate)) / 86400000)); }
const labPosKey = (db, u, mid) => { // the lab iframe only knows positional names ("B1".."B6" / "M1".."M7"), not this app's random module ids - bridge via list position
  const mods = db.questions[u.track] || []; const idx = mods.findIndex((m) => m.id === mid);
  if (idx <= 0) return null; // idx 0 is Module 0 (intro videos) - no lab counterpart
  // match by the code at the start of the title (C1, BF, B3, M5 ...) so reordering or adding modules never shifts the mapping
  const code = (((mods[idx].title || "").trim().match(/^(C[1-3]|BF|MF|[BM][1-7])\b/i) || [])[1] || "").toUpperCase();
  return code && (LAB_IDS[u.track] || []).includes(code) ? code : null; // no lab counterpart -> don't block on it
};
const labPassed = (db, u, mid) => { const k = labPosKey(db, u, mid); if (!k) return true; return !!(((db.labProgress || {})[u.id] || {})[u.track] || {})[k]; }; // no lab counterpart (Module 0) -> don't block on it
const videoWatched = (db, u, mid) => {
  // despite the name, this now covers every media type a module can carry -
  // videos need 85% watched, PDFs need at least one download, text notes
  // need an explicit "Mark as read". A module with only a PDF or only a
  // text note no longer completes itself with zero student interaction.
  const mods = db.questions[u.track] || []; const mod = mods.find((m) => m.id === mid);
  const media = mod?.media || [];
  if (!media.length) return true; // nothing uploaded yet - don't block on missing content
  const vp = ((db.videoProgress || {})[u.id] || {})[mid];
  const items = (vp && vp.items) || {};
  return media.every((it) => {
    const p = items[it.id];
    if (it.kind === "video") return p && p.duration > 10 && p.seconds / p.duration >= 0.85;
    return !!p; // pdf downloaded at least once, or text explicitly marked read
  });
};
const cDone = (db, u, mid) => labPassed(db, u, mid) && videoWatched(db, u, mid);
function allPassed(db, u) { const t = u.track; if (!t) return false; const mods = db.questions[t]; if (!mods.length) return false; const modsOk = mods.slice(1).every((m) => cDone(db, u, m.id)); const ids = Object.keys(PROJ_TITLES[t] || {}); const ps = (db.projectSubs || {})[u.id] || {}; const projOk = ids.length > 0 && ids.every((pid) => ps[pid] && ps[pid].approved); return modsOk && projOk; } // mods.slice(1): Module 0 (intro videos) is informational, not gated
const auditPush = (db, msg, who) => [{ at: NOW(), msg, who }, ...(db.audit || [])].slice(0, 150);
function exportCSV(headers, rows, filename) { const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`; const csv = [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n"); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

/* ================================================================== */
export default function App() {
  const [db, setDb] = useState(null); const [session, setSession] = useState(null); const [view, setView] = useState("public"); const [toast, setToast] = useState(null); const [wsTrack, setWsTrack] = useState("btech"); const [projId, setProjId] = useState(null);
  const [theme, setTheme] = useState("light");
  useEffect(() => { (async () => { try { const r = await window.storage.get("caee:theme", false); if (r && r.value) setTheme(r.value); } catch (e) {} })(); }, []);
  useEffect(() => { try { document.documentElement.dataset.theme = theme; } catch (e) {} }, [theme]);
  const flipTheme = () => { const t = theme === "dark" ? "light" : "dark"; setTheme(t); try { window.storage.set("caee:theme", t, false); } catch (e) {} };
  useEffect(() => { if (db && db.site) setAiKey(db.site.aiKey); }, [db]);
  useEffect(() => { load().then((d) => { setDb(d); (async () => { try { const r = await window.storage.get("caee:session", false); const id = r && r.value; if (id) { const u = d.users.find((x) => x.id === id); if (u) { setSession(u); setView(u.mustSetPassword ? "setpw" : (u.role === "student" ? "student" : u.role)); } } } catch (e) {} try { if (/^#remote-?lab$/i.test(window.location.hash) && rlOf(d).settings.publicPage) setView("remotelab"); } catch (e) {} })(); }); }, []);
  const saveTimer = useRef();
  const commit = useCallback((next) => { setDb(next); clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => save(next), 400); }, []);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2800); };
  if (!db) return (<><Style /><div className="surface" style={{ minHeight: "100vh", padding: "70px 20px" }}><div style={{ maxWidth: 960, margin: "0 auto" }}><div className="skel" style={{ height: 34, width: 220, marginBottom: 26 }} /><div className="skel" style={{ height: 120, marginBottom: 18 }} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><div className="skel" style={{ height: 160 }} /><div className="skel" style={{ height: 160 }} /></div><div className="skel" style={{ height: 60, marginTop: 18 }} /></div></div></>);
  const goHome = () => setView(!session ? "public" : session.role === "student" ? "student" : session.role);
  const openProject = (id) => { setProjId(id); setView("project"); };
  const persistSession = (id) => { try { if (id) window.storage.set("caee:session", id, false); else window.storage.delete("caee:session", false); } catch (e) {} };
  const doLogin = async (email, pw) => {
    let u;
    try {
      const res = window.__caeeAuth ? await window.__caeeAuth.login(email, pw) : null;
      if (!res || !res.ok) return flash("Invalid email or password");
      u = res.user;
      window.__caeeLabToken = typeof res.labToken === "string" ? res.labToken : null; // per-user lab session (signed by the server); never a shared secret
      try { if (window.__caeeLabToken) sessionStorage.setItem("caee:labToken", window.__caeeLabToken); else sessionStorage.removeItem("caee:labToken"); } catch (e) {}
    } catch (e) { return flash("Could not reach the server — try again"); }
    if (u.role !== "student") { const lock = (db.site.security && db.site.security.deviceLock) || {}; if (lock.on && (lock.code || "").trim()) {
      let trusted = ""; try { const r = await window.storage.get("caee:admindev", false); trusted = (r && r.value) || ""; } catch (e) {}
      if (trusted !== lock.code) { const entered = (typeof window !== "undefined" && window.prompt) ? window.prompt("Admin device check — enter the device authorization code for this device:") : null; if (entered == null) return; if (entered.trim() !== lock.code) return flash("This device is not authorized for admin access"); try { await window.storage.set("caee:admindev", lock.code, false); } catch (e) {} flash("Device authorized"); } } } setSession(u); persistSession(u.id); if (u.mustSetPassword) { setView("setpw"); flash("Welcome — please set your own password"); return; } setView(u.role === "student" ? "student" : u.role); flash(`Signed in as ${u.name}`); };
  const doActivate = async (email, otp, phone) => {
    let u;
    try {
      const res = window.__caeeAuth ? await window.__caeeAuth.activate(email, otp) : null;
      if (!res || !res.ok) return flash("Email and one-time password do not match");
      u = res.user;
    } catch (e) { return flash("Could not reach the server — try again"); }
    const ph = (phone || "").trim(); if (!ph && !u.phone) return flash("Please enter your phone number"); const e = email.trim().toLowerCase(); const upd = ph ? { ...u, phone: ph } : u; commit({ ...db, users: db.users.map((x) => x.id === u.id ? upd : x), resetRequests: (db.resetRequests || []).filter((r) => r.email !== e) }); setSession(upd); persistSession(u.id); setView("setpw"); flash("Verified - now set your password"); };
  const logout = () => { if (window.__caeeUnsaved && !window.confirm("You have unsaved changes in the admin panel. Sign out and lose them?")) return; window.__caeeLabToken = null; try { sessionStorage.removeItem("caee:labToken"); } catch (e) {} setSession(null); persistSession(null); setView("public"); flash("Signed out"); };
  return (<div className="surface" style={{ minHeight: "100vh" }}><Style />
    <TopBar session={session} view={view} setView={setView} goHome={goHome} logout={logout} theme={theme} flipTheme={flipTheme} rlOn={rlOf(db).settings.publicPage} />
    {view === "public" && <Landing db={db} setView={setView} openProject={openProject} openWorkshop={(t) => { setWsTrack(t); setView("workshop"); }} />}
    {view === "projects" && <ProjectsFeed db={db} commit={commit} flash={flash} openProject={openProject} setView={setView} />}
    {view === "project" && <ProjectPage db={db} projId={projId} setView={setView} openProject={openProject} />}
    {view === "workshop" && <Workshop db={db} commit={commit} track={wsTrack} setView={setView} flash={flash} />}
    {(view === "btech" || view === "mtech") && <TrackPage track={view} db={db} setView={setView} />}
    {view === "remotelab" && <RemoteLabPage db={db} commit={commit} setView={setView} flash={flash} session={session} />}
    {view === "rlab" && session?.role === "student" && <RemoteLabWorkspace db={db} session={session} setView={setView} />}
    {view === "register" && <Register db={db} commit={commit} setView={setView} flash={flash} />}
    {view === "verify" && <Verify db={db} setView={setView} />}
    {view === "login" && <Login doLogin={doLogin} setView={setView} />}
    {view === "setpw" && session?.role === "student" && <SetPassword db={db} commit={commit} session={session} setSession={setSession} setView={setView} flash={flash} />}
    {view === "activate" && <Activate doActivate={doActivate} setView={setView} />}
    {view === "forgot" && <Forgot db={db} commit={commit} setView={setView} flash={flash} />}
    {view === "student" && session?.role === "student" && <CourseHub db={db} session={session} setView={setView} />}
    {view === "learn" && session?.role === "student" && <StudentPortal db={db} commit={commit} session={session} flash={flash} setView={setView} />}
    {view === "quiz" && session?.role === "student" && <Quiz db={db} commit={commit} session={session} setView={setView} flash={flash} />}
    {view === "resume" && session?.role === "student" && <ResumePage db={db} session={session} setView={setView} />}
    {view === "career" && session?.role === "student" && <CareerPage db={db} session={session} setView={setView} />}
    {view === "results" && session?.role === "student" && <Results db={db} commit={commit} session={session} setView={setView} flash={flash} />}
    {(view === "admin" || view === "superadmin") && session && (session.role === "admin" || session.role === "superadmin") && <Dash db={db} commit={commit} session={session} flash={flash} isSuper={session.role === "superadmin"} />}
    {!session && db.site.whatsapp && view !== "login" && <a className="wa" href={`https://wa.me/${db.site.whatsapp}`} target="_blank" rel="noreferrer" title="WhatsApp" aria-label="Chat with us on WhatsApp"><MessageSquare size={22} color="#fff" /></a>}
    {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
  </div>);
}

/* ---------- theme ---------- */
/* Layout utilities used in className (grid, gap, max-w-*, mx-auto, px-5, sm:/md: columns). Compiled once with
   Tailwind CSS v3 (no preflight/reset) — the live site never loaded Tailwind, so these classes did nothing before. */
const LAYOUT_CSS = ".mx-auto{margin-left:auto;margin-right:auto}.grid{display:grid}.max-w-2xl{max-width:42rem}.max-w-3xl{max-width:48rem}.max-w-4xl{max-width:56rem}.max-w-5xl{max-width:64rem}.max-w-6xl{max-width:72rem}.max-w-lg{max-width:32rem}.max-w-md{max-width:28rem}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.gap-10{gap:2.5rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-5{gap:1.25rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}@media (min-width:640px){.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.sm\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}}@media (min-width:768px){.md\\:col-span-2{grid-column:span 2/span 2}.md\\:col-span-3{grid-column:span 3/span 3}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}}";
function Style() {
  return (<><style>{LAYOUT_CSS}</style><style>{`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  :root{--navy:#081b2c;--navy2:#0d2740;--bg:#f4f8fb;--bg2:#fff;--tint:#e9f1f7;--card:#fff;--border:#d7e2ea;--border2:#bcd0dd;--ink:#0f2233;--head:#081b2c;--muted:#4d6478;--faint:#647c8c;--green:#00b7d9;--green-d:#0092ad;--teal:#1fc7a4;--gold:#e8b84b;--gold-d:#c79a2f;--cta:#ff6b35;--cta-d:#e0551f;--pass:#1f9d57;--fail:#d23b3f;--passbg:#e6f6ec;--failbg:#fbe9e9}
  [data-theme="dark"]{--bg:#0d1a17;--bg2:#12211d;--tint:#16302a;--card:#132420;--border:#22403a;--border2:#2c5049;--ink:#d9ece7;--head:#8fd4c2;--muted:#8fb0a8;--faint:#6e8a85;--passbg:#123527;--failbg:#3a1b1c;}
  [data-theme="dark"] .code{background:#0a1512}
  button:focus-visible,.btn:focus-visible,.tab:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--green);outline-offset:2px;border-radius:8px}
  @media(max-width:640px){.btn{min-height:44px}.tab{min-height:40px;padding:8px 12px}.iconbtn{min-width:36px;min-height:36px}}
  @keyframes shimmer{0%{background-position:-500px 0}100%{background-position:500px 0}}
  .skel{border-radius:12px;background:linear-gradient(90deg,var(--tint) 25%,var(--card) 50%,var(--tint) 75%);background-size:1000px 100%;animation:shimmer 1.4s infinite linear}
  .bottomnav{display:none}
  @media(max-width:640px){.bottomnav{position:fixed;bottom:0;left:0;right:0;display:flex;background:var(--bg2);border-top:1px solid var(--border);z-index:60;padding:4px 6px calc(4px + env(safe-area-inset-bottom))}
    .bottomnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 2px;font-size:10.5px;font-weight:600;color:var(--muted);background:none;border:none}
    .bottomnav button.on{color:var(--green-d)}}
  .reddot{position:absolute;top:-2px;right:-4px;width:9px;height:9px;border-radius:50%;background:#d23b3f;border:2px solid var(--bg2)}
  *{box-sizing:border-box}
  html,body{max-width:100%;overflow-x:hidden}
  .surface{background:var(--bg);color:var(--ink);font-family:'Inter Tight',sans-serif;overflow-x:hidden;overflow-wrap:break-word}
  img{max-width:100%}
  @media (max-width:640px){.input,.ta,.sel{font-size:16px}}
  .disp{font-family:'Sora',sans-serif;letter-spacing:-.01em}.mono{font-family:'JetBrains Mono',monospace}
  .head{color:var(--head)}.ink{color:var(--ink)}.muted{color:var(--muted)}.faint{color:var(--faint)}
  .c-green{color:var(--green)}.c-gold{color:var(--gold-d)}.c-teal{color:var(--teal)}.c-pass{color:var(--pass)}.c-fail{color:var(--fail)}
  .bg2{background:var(--bg2)}.tint{background:var(--tint)}
  .card{background:var(--card);border:1px solid var(--border);border-radius:18px;box-shadow:0 1px 3px rgba(10,40,38,.05)}
  .divider{border-bottom:1px solid var(--border)}.divider-t{border-top:1px solid var(--border)}.hr-b{border-bottom:1px solid var(--border)}
  .eyebrow{color:var(--gold-d);text-transform:uppercase;letter-spacing:.12em;font-weight:600}
  .gridbg{background-image:linear-gradient(rgba(31,139,139,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(31,139,139,.06) 1px,transparent 1px);background-size:36px 36px}
  .hero-dark{--head:#fff;--ink:#e7f0f7;--muted:#a9c0d1;--faint:#8aa4b8;--border:rgba(255,255,255,.14);background:var(--navy);background-image:linear-gradient(rgba(0,183,217,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(0,183,217,.09) 1px,transparent 1px);background-size:36px 36px}
  .hero-dark .btn-ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.4)}.hero-dark .btn-ghost:hover{border-color:var(--green);color:var(--green);background:rgba(0,183,217,.08)}
  .hero-visual line,.hero-visual circle,.hero-visual path{vector-effect:non-scaling-stroke}
  .hl{color:var(--gold-d)}
  .btn{padding:.5rem 1rem;border-radius:11px;font-size:.875rem;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;cursor:pointer;border:1px solid transparent;transition:.15s;font-family:'Inter Tight',sans-serif}
  .btn-primary{background:var(--green);color:#fff}.btn-primary:hover{background:var(--green-d)}
  .btn-gold{background:var(--gold);color:#3a2c06}.btn-gold:hover{background:var(--gold-d);color:#fff}
  .btn-cta{background:var(--cta);color:#fff;box-shadow:0 6px 16px rgba(238,107,45,.30)}.btn-cta:hover{background:var(--cta-d);transform:translateY(-1px);box-shadow:0 9px 22px rgba(238,107,45,.38)}
  .btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
  @keyframes ctapulse{0%,100%{box-shadow:0 6px 16px rgba(238,107,45,.30)}50%{box-shadow:0 6px 22px rgba(238,107,45,.55)}}.btn-cta.pulse{animation:ctapulse 2.4s ease-in-out infinite}
  .btn-ghost{background:#fff;border-color:var(--border2);color:var(--head)}.btn-ghost:hover{border-color:var(--green);color:var(--green)}
  .btn-good{background:var(--passbg);color:var(--pass);border-color:rgba(31,157,87,.35)}.btn-good:hover{background:#d7f0e0}
  .btn-danger{background:var(--failbg);color:var(--fail);border-color:rgba(210,59,63,.3)}.btn-danger:hover{background:#f7dcdc}
  .btn-sm{padding:.3rem .6rem;font-size:.75rem;border-radius:9px}.btn[disabled]{opacity:.55;cursor:default}
  .lbl{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:4px}
  .input,.ta,.sel{width:100%;background:#fff;border:1px solid var(--border2);border-radius:11px;padding:.5rem .75rem;font-size:.875rem;color:#0f2233;font-family:'Inter Tight',sans-serif}
  .input::placeholder,.ta::placeholder{color:#7c8f9c}
  .input:focus,.ta:focus,.sel:focus{outline:none;border-color:var(--green);box-shadow:0 0 0 3px rgba(43,166,101,.12)}
  .ta{font-family:'JetBrains Mono',monospace}.input.has-ic{padding-left:2.2rem}
  .pill{font-size:11px;padding:.15rem .55rem;border-radius:999px;font-weight:700;display:inline-flex;align-items:center;gap:.25rem}
  .pill-green{background:rgba(43,166,101,.12);color:var(--green-d)}.pill-gold{background:rgba(232,184,75,.18);color:var(--gold-d)}
  .badge{font-size:11px;padding:.1rem .5rem;border-radius:999px;font-weight:700}
  .b-ns{background:#eef2f1;color:var(--muted)}.b-sub{background:rgba(232,184,75,.2);color:var(--gold-d)}.b-pass{background:var(--passbg);color:var(--pass)}.b-fail{background:var(--failbg);color:var(--fail)}.b-pending{background:rgba(232,184,75,.2);color:var(--gold-d)}.b-approved{background:var(--passbg);color:var(--pass)}.b-rejected{background:var(--failbg);color:var(--fail)}.b-Ahead{background:var(--passbg);color:var(--pass)}.b-Behind{background:var(--failbg);color:var(--fail)}.b-On{background:rgba(31,139,139,.14);color:var(--teal)}
  .row-btn{width:100%;text-align:left;background:#fff;border:1px solid var(--border);border-radius:13px;padding:.7rem 1rem;display:flex;align-items:center;gap:1rem;cursor:pointer;transition:.12s}.row-btn:hover{border-color:var(--green);box-shadow:0 1px 4px rgba(10,40,38,.06)}
  .track-fill{height:100%;background:var(--green);border-radius:999px}.track-bg{height:8px;background:var(--tint);border-radius:999px;overflow:hidden}
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:70;padding:.75rem 1.25rem;border-radius:11px;background:var(--head);color:#fff;font-size:.875rem;font-weight:600;box-shadow:0 8px 24px rgba(10,40,38,.25)}
  .header{position:sticky;top:0;z-index:40;border-bottom:1px solid var(--border);background:rgba(238,244,242,.9);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
  .header .bar{min-height:56px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding-top:7px;padding-bottom:7px}
  .logo{width:36px;height:36px;border-radius:10px;background:var(--green);display:flex;align-items:center;justify-content:center}
  .navlink{font-size:.875rem;color:var(--muted);background:none;border:none;cursor:pointer;padding:0 .5rem}.navlink:hover{color:var(--green)}
  .stat-cell{background:var(--card);padding:1.25rem}.stat-grid{display:grid;gap:1px;background:var(--border);border-radius:18px;overflow:hidden;border:1px solid var(--border)}
  .upload{display:flex;align-items:center;gap:.75rem;background:#fff;border:1.5px dashed var(--border2);border-radius:12px;padding:1rem;cursor:pointer}.upload:hover{border-color:var(--green)}
  .tab{padding:.6rem 1rem;font-size:.875rem;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;cursor:pointer;color:var(--muted);display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.tab.active{border-bottom-color:var(--green);color:var(--green)}
  .tabbar{display:flex;gap:.25rem;border-bottom:1px solid var(--border);flex-wrap:wrap;margin-bottom:1.5rem;overflow-x:auto}
  .toggle{display:flex;align-items:center;gap:.5rem;padding:.5rem .75rem;border-radius:11px;font-size:.75rem;font-weight:700;border:1px solid var(--border2);background:#fff;color:var(--muted);cursor:pointer}.toggle.on{background:rgba(43,166,101,.1);border-color:var(--green);color:var(--green-d)}
  .perm{display:flex;align-items:center;gap:.5rem;padding:.5rem .75rem;border-radius:11px;font-size:.75rem;text-align:left;border:1px solid var(--border2);background:#fff;color:var(--muted);cursor:pointer}.perm.on{background:var(--passbg);border-color:rgba(31,157,87,.4);color:var(--pass)}
  .tickbox{width:16px;height:16px;border-radius:5px;border:1px solid var(--faint);display:flex;align-items:center;justify-content:center;flex:none}.tickbox.on{background:var(--green);border-color:var(--green)}
  .note{background:var(--tint);border-radius:11px;padding:.65rem .75rem;font-size:.75rem;color:var(--muted)}
  .inline-edit{flex:1;background:transparent;border:none;border-bottom:1px solid transparent;font-size:.875rem;font-weight:500;color:var(--head);padding-bottom:2px;font-family:'Inter Tight',sans-serif}.inline-edit:hover{border-bottom-color:var(--border2)}.inline-edit:focus{outline:none;border-bottom-color:var(--green)}
  .tbl{width:100%;border-collapse:separate;border-spacing:0;font-size:.82rem;min-width:840px}
  .tbl th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:700;padding:10px 12px;border-bottom:1px solid var(--border);background:var(--tint);white-space:nowrap}
  .tbl td{padding:10px 12px;border-bottom:1px solid var(--border);color:var(--ink);vertical-align:middle}.tbl tr:last-child td{border-bottom:none}.tbl tr:hover td{background:#f6fbf9}
  .tile{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px 18px}
  .iconbtn{background:#fff;border:1px solid var(--border2);border-radius:9px;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:var(--head)}.iconbtn:hover{border-color:var(--green);color:var(--green)}
  .access-on{background:var(--green);border:none;color:#fff;border-radius:999px;padding:.25rem .6rem;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;gap:4px;align-items:center}
  .access-off{background:#fff;border:1px solid var(--border2);color:var(--muted);border-radius:999px;padding:.25rem .6rem;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;gap:4px;align-items:center}
  .code{background:#0d2b29;color:#cfe8e0;font-family:'JetBrains Mono',monospace;font-size:11px;border-radius:11px;padding:12px;white-space:pre-wrap;max-height:240px;overflow:auto;line-height:1.45}
  .wa{position:fixed;right:20px;bottom:20px;z-index:45;width:52px;height:52px;border-radius:999px;background:#25d366;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(37,211,102,.4)}
  .fbk{background:rgba(31,139,139,.08);border-left:3px solid var(--teal);border-radius:10px;padding:.6rem .8rem;font-size:.8rem;color:var(--ink)}
  .step{position:relative;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px}
  .stepnum{width:30px;height:30px;border-radius:999px;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'Sora';font-size:.85rem}
  .mediaframe{border-radius:14px;overflow:hidden;border:1px solid var(--border);background:#0d2b29}
  .noselect,.noselect *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
  .noselect input,.noselect textarea{-webkit-user-select:text;user-select:text}
  .wm{position:fixed;inset:0;pointer-events:none;z-index:30;overflow:hidden;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:32px 56px;transform:rotate(-24deg) scale(1.5);opacity:.06}
  .wm span{font-family:'JetBrains Mono';font-size:13px;color:#0a5757;white-space:nowrap}
  .blurcover{position:fixed;inset:0;z-index:60;background:rgba(238,244,242,.98);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;text-align:center;padding:20px}
  .price-mrp{color:var(--muted);text-decoration:line-through;font-size:.95rem}
  .hscroll{display:flex;gap:16px;overflow-x:auto;padding:4px 2px 12px;scroll-snap-type:x mandatory}
  .hscroll::-webkit-scrollbar{height:8px}.hscroll::-webkit-scrollbar-thumb{background:var(--border2);border-radius:9px}
  .postcard{min-width:300px;max-width:300px;scroll-snap-align:start;flex:none}
  .rl-navlink{color:var(--green-d);font-weight:700;display:inline-flex;align-items:center;gap:4px;border:1px solid rgba(0,183,217,.45);border-radius:999px;padding:.28rem .7rem;background:rgba(0,183,217,.07)}.rl-navlink.on,.rl-navlink:hover{background:var(--green);color:#fff;border-color:var(--green)}
  .rl-band{background:linear-gradient(135deg,rgba(0,183,217,.10),rgba(31,199,164,.08) 55%,rgba(232,184,75,.08));}
  .rl-bigtitle{font-size:min(10vw,3.4rem);font-weight:800;line-height:1.04;letter-spacing:-.02em}
  .rl-herotitle{font-size:min(10vw,4rem);font-weight:800;line-height:1.04;max-width:900px;letter-spacing:-.02em}
  .rl-dot{width:8px;height:8px;border-radius:999px;display:inline-block}
  .rl-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}@media(max-width:900px){.rl-flow{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.rl-flow{grid-template-columns:1fr}}
  .rl-proj{padding:18px;display:flex;flex-direction:column}
  .rl-node{border:1.5px solid var(--border2);border-radius:12px;padding:10px 12px;background:var(--bg2);text-align:center;min-width:0}
  .rl-wire-v{width:2px;height:14px;background:var(--border2)}
  .rl-bench{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:8px;align-items:center;margin-top:2px}@media(max-width:520px){.rl-bench{grid-template-columns:1fr}.rl-buses{padding:6px 0}}
  .rl-buses{display:flex;flex-direction:column;gap:10px}
  .rl-bus{position:relative;height:22px;display:flex;align-items:center;justify-content:center}.rl-bus:before{content:"";position:absolute;left:0;right:0;top:50%;height:3px;border-radius:3px;background:var(--green)}.rl-bus span{position:relative;background:var(--card);padding:0 6px;font-size:10.5px;font-weight:700;color:var(--green-d);font-family:'JetBrains Mono',monospace;white-space:nowrap}
  .rl-bus-b:before{background:var(--gold)}.rl-bus-b span{color:var(--gold-d)}
  .rl-shell{display:grid;grid-template-columns:210px minmax(0,1fr);gap:18px;align-items:start}@media(max-width:860px){.rl-shell{grid-template-columns:minmax(0,1fr)}}
  .rl-nav{display:flex;flex-direction:column;gap:3px;position:sticky;top:72px}@media(max-width:860px){.rl-nav{flex-direction:row;overflow-x:auto;position:static;padding-bottom:6px}}
  .rl-navbtn{display:flex;align-items:center;gap:8px;text-align:left;padding:.5rem .7rem;border-radius:10px;border:1px solid transparent;background:none;color:var(--muted);font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap}.rl-navbtn:hover{background:var(--tint);color:var(--head)}.rl-navbtn.on{background:var(--card);border-color:var(--border);color:var(--green-d);box-shadow:0 1px 3px rgba(10,40,38,.06)}
  .rl-count{margin-left:auto;background:var(--cta);color:#fff;border-radius:999px;font-size:10px;padding:0 6px;font-weight:700}
  .rl-steps{display:flex;gap:6px;flex-wrap:wrap}.rl-step{display:flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:999px;border:1px solid var(--border);background:var(--bg2);font-size:12px;font-weight:600;color:var(--faint)}.rl-step-dot{width:20px;height:20px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:var(--tint);color:var(--muted);font-size:10.5px;font-weight:700}.rl-step.done{color:var(--pass);border-color:rgba(31,157,87,.35)}.rl-step.done .rl-step-dot{background:var(--pass);color:#fff}.rl-step.now{color:var(--green-d);border-color:var(--green)}.rl-step.now .rl-step-dot{background:var(--green);color:#fff;animation:ctapulse 1.6s ease-in-out infinite}.rl-step.bad{color:var(--fail);border-color:rgba(210,59,63,.4)}.rl-step.bad .rl-step-dot{background:var(--fail);color:#fff}
  .rl-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}@media(max-width:760px){.rl-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `}</style></>);
}

/* ---------- primitives ---------- */
const Field = ({ label, icon: Ic, ...p }) => (<label style={{ display: "block", marginBottom: 12 }}><span className="lbl">{label}</span><div style={{ position: "relative" }}>{Ic && <Ic size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} />}<input {...p} className={`input ${Ic ? "has-ic" : ""}`} /></div></label>);
const Area = ({ label, ...p }) => (<label style={{ display: "block", marginBottom: 12 }}><span className="lbl">{label}</span><textarea {...p} className="ta" /></label>);
const Btn = ({ children, kind = "primary", sm, ...p }) => <button {...p} className={`btn btn-${kind} ${sm ? "btn-sm" : ""}`}>{children}</button>;
const Card = ({ children, className = "", style }) => <div className={`card ${className}`} style={style}>{children}</div>;
const Badge = ({ status }) => { const m = { "Not started": "b-ns", Submitted: "b-sub", Passed: "b-pass", Failed: "b-fail", pending: "b-pending", approved: "b-approved", rejected: "b-rejected", Ahead: "b-Ahead", Behind: "b-Behind", "On track": "b-On" }; return <span className={`badge ${m[status] || "b-ns"}`}>{status}</span>; };
const SectionTitle = ({ icon: Ic, k, t }) => (<div style={{ marginBottom: 26 }}><div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, marginBottom: 8 }}><Ic size={13} /> {k}</div><h2 className="disp head" style={{ fontSize: "1.7rem", fontWeight: 700 }}>{t}</h2></div>);
const Empty = ({ msg }) => <Card style={{ padding: 32, textAlign: "center" }}><span className="muted" style={{ fontSize: ".875rem" }}>{msg}</span></Card>;
const BackLink = ({ onClick }) => <button className="navlink" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 4, padding: 0 }}><ArrowLeft size={15} /> Back</button>;
const PriceTag = ({ p }) => (<div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>{p.mrp > p.price && <span className="price-mrp">{fmt(p.mrp)}</span>}<span className="disp head" style={{ fontSize: "1.5rem", fontWeight: 800 }}>{fmt(p.price)}</span><span className="muted" style={{ fontSize: 12 }}>/ {p.period}</span></div>);
function VideoEmbed({ url, height = 220 }) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]+)/);
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (yt) return <div className="mediaframe"><iframe loading="lazy" src={`https://www.youtube.com/embed/${yt[1]}`} style={{ width: "100%", height, border: 0, display: "block" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="video" /></div>;
  if (vm) return <div className="mediaframe"><iframe src={`https://player.vimeo.com/video/${vm[1]}`} style={{ width: "100%", height, border: 0, display: "block" }} allowFullScreen title="video" /></div>;
  return <div className="mediaframe"><video src={url} controls controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} style={{ width: "100%", height, display: "block", background: "#000" }} /></div>;
}

/* ---------- top bar ---------- */
function TopBar({ session, view, setView, goHome, logout, theme, flipTheme, rlOn }) {
  const rlLink = rlOn ? <button className={`navlink rl-navlink ${view === "remotelab" || view === "rlab" ? "on" : ""}`} onClick={() => setView("remotelab")}><Cpu size={13} /> Remote Lab</button> : null;
  return (<header className="header"><div className="max-w-6xl mx-auto px-5 bar">
    <button onClick={goHome} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }} aria-label="CAEE home"><div className="logo"><CircuitBoard size={20} color="#fff" /></div><div style={{ textAlign: "left", lineHeight: 1 }}><div className="disp head" style={{ fontWeight: 700, fontSize: 15 }}>CAEE</div><div className="faint" style={{ fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase" }}>Automotive Embedded</div></div></button>
    <nav style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {!session && (<><button className="navlink" onClick={() => setView("btech")}>B.Tech</button><button className="navlink" onClick={() => setView("mtech")}>M.Tech</button>{rlLink}<button className="navlink" onClick={() => setView("public")}>Free workshop</button><button className="navlink" onClick={() => setView("projects")}>Experiments</button><button className="iconbtn" title={theme === "dark" ? "Light mode" : "Dark mode"} onClick={flipTheme} style={{ width: 32, height: 32 }}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button>{view !== "register" && <Btn kind="cta" onClick={() => setView("register")}><GraduationCap size={15} /> Register</Btn>}<Btn onClick={() => setView("login")}><LogIn size={15} /> Sign in</Btn></>)}
      {session && (<>{session.role === "student" && (<><button className="navlink" onClick={() => setView("public")}><Home size={14} style={{ verticalAlign: "-2px" }} /> Home</button><button className="navlink" onClick={() => setView("projects")}>Experiments</button><button className="navlink" onClick={() => setView("btech")}>B.Tech</button><button className="navlink" onClick={() => setView("mtech")}>M.Tech</button>{rlLink}<Btn kind="ghost" onClick={() => setView("student")}><GraduationCap size={15} /> My course</Btn></>)}<span className="muted" style={{ fontSize: 12, marginRight: 4, display: "flex", alignItems: "center", gap: 6 }}>{session.role === "superadmin" && <ShieldCheck size={14} className="c-green" />}{session.role === "admin" && <Eye size={14} className="c-green" />}{session.role === "student" && <GraduationCap size={14} className="c-green" />}{session.name}</span><Btn kind="ghost" onClick={logout}><LogOut size={15} /> Sign out</Btn></>)}
    </nav></div></header>);
}

/* ================= LANDING ================= */
function Landing({ db, setView, openWorkshop, openProject }) {
  const s = db.site; const reg = s.registration || { open: true }; const ws = s.workshop || {};
  const wsClosed = ws.open === false || (ws.deadline && new Date(ws.deadline) < new Date(new Date().toDateString()));
  return (<div>
    <section className="hero-dark hr-b" style={{ position: "relative", overflow: "hidden" }}><svg className="hero-visual" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", right: "-8%", top: "50%", transform: "translateY(-50%)", width: "46%", minWidth: 320, height: "auto", opacity: 0.5, pointerEvents: "none" }} aria-hidden="true"><g fill="none" stroke="#00b7d9" strokeWidth="1.5" opacity="0.55"><line x1="300" y1="300" x2="150" y2="150" /><line x1="300" y1="300" x2="450" y2="150" /><line x1="300" y1="300" x2="150" y2="450" /><line x1="300" y1="300" x2="450" y2="450" /><line x1="300" y1="300" x2="300" y2="120" /><line x1="150" y1="150" x2="90" y2="90" /><line x1="450" y1="450" x2="510" y2="510" /></g><g fill="#00b7d9"><circle cx="300" cy="300" r="10" /><circle cx="150" cy="150" r="6" opacity="0.85" /><circle cx="450" cy="150" r="6" opacity="0.85" /><circle cx="150" cy="450" r="6" opacity="0.85" /><circle cx="450" cy="450" r="6" opacity="0.85" /><circle cx="300" cy="120" r="5" opacity="0.7" /></g><g fill="#1fc7a4"><circle cx="90" cy="90" r="4" opacity="0.7" /><circle cx="510" cy="510" r="4" opacity="0.7" /></g><path d="M 60 500 L 100 500 L 110 480 L 125 520 L 140 470 L 150 500 L 190 500" stroke="#1fc7a4" strokeWidth="1.5" opacity="0.5" /><rect x="270" y="270" width="60" height="60" rx="8" fill="none" stroke="#00b7d9" strokeWidth="1.5" opacity="0.7" /></svg><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 70, paddingBottom: 84, position: "relative" }}>
      <div className="pill pill-gold" style={{ marginBottom: 18 }}><CarFront size={13} /> PAID INDUSTRY INTERNSHIP PROGRAMME</div>
      {!reg.open && <div className="note" style={{ marginBottom: 16, display: "inline-block", background: "rgba(232,184,75,.18)", color: "var(--gold-d)" }}><CalendarClock size={13} style={{ verticalAlign: "-2px" }} /> Registrations are currently closed{reg.nextDate ? ` · next batch opens ${reg.nextDate}` : ""}.</div>}
      <h1 className="disp head" style={{ fontSize: "min(9vw,3.6rem)", fontWeight: 800, lineHeight: 1.05, maxWidth: 760 }}>Build real <span className="hl">automotive</span> firmware.<br />Not slideware.</h1>
      <p className="muted" style={{ marginTop: 20, maxWidth: 560, fontSize: "1.1rem" }}>{s.heroTag}</p>
      <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}><Btn kind="cta" className="pulse" onClick={() => setView("register")}>{reg.open ? "Register for an internship" : "Registration info"} <ChevronRight size={16} /></Btn><a className="btn btn-ghost" href="#free"><GraduationCap size={15} /> Start free workshop</a></div>
      <div className="muted" style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12.5 }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} className="c-pass" /> Start free — no payment to begin</span><span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} className="c-pass" /> Verifiable certificate</span><span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} className="c-pass" /> Placement support via Anadiwave</span></div>
      <div className="stat-grid grid-cols-2 sm:grid-cols-4" style={{ marginTop: 52 }}>{s.stats.map((x, i) => (<div className="stat-cell" key={i}><div className="disp c-green" style={{ fontSize: "1.9rem", fontWeight: 800 }}>{x.k}</div><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{x.v}</div></div>))}</div>
    </div></section>
    <RemoteLabHomeBand db={db} setView={setView} />

    {s.heroVideo && (<section className="hr-b"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 48, paddingBottom: 48 }}><SectionTitle icon={Cpu} k="See it live" t="Watch the CAEE lab run" /><p className="muted" style={{ fontSize: ".92rem", maxWidth: 620, marginBottom: 16 }}>Real STM32 hardware, driven by student code — this is the lab you get access to.</p><Card style={{ padding: 10, maxWidth: 860 }}><VideoEmbed url={s.heroVideo} height={430} /></Card></div></section>)}
    <section id="free" className="bg2 hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <SectionTitle icon={GraduationCap} k="Start free" t="Free 2-day workshop" />
      <p className="muted" style={{ fontSize: ".95rem", marginBottom: 20, maxWidth: 620 }}>New to embedded? Start here. Pick your track, register, and get a free certificate on passing the assessment — then step into the full paid internship.{ws.deadline ? ` Free registration ends ${ws.deadline}.` : ""}</p>
      <div className="grid sm:grid-cols-2 gap-5">{["btech", "mtech"].map((t) => { const T = TRACK[t]; const c = (ws[t]) || {}; return (<Card key={t} style={{ padding: 22 }}>
        <div className="pill pill-green" style={{ marginBottom: 10 }}>{T.tag}</div>
        <div className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem" }}>{c.title || T.name}</div>
        <div className="muted" style={{ fontSize: ".84rem", marginTop: 6 }}>{(c.packs ? c.packs.length : 2)} modules · final assessment · free certificate</div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Btn kind="cta" onClick={() => openWorkshop(t)} disabled={wsClosed}>{wsClosed ? "Registration closed" : "Start this free workshop"} {!wsClosed && <ChevronRight size={15} />}</Btn>
          {ws.deadline && <span className="faint mono" style={{ fontSize: 11 }}><CalendarClock size={11} style={{ verticalAlign: "-2px" }} /> ends {ws.deadline}</span>}
        </div>
      </Card>); })}</div>
    </div></section>

    <section className="max-w-6xl mx-auto px-5" style={{ paddingTop: 72, paddingBottom: 72 }}><div className="grid md:grid-cols-2 gap-10" style={{ alignItems: "start" }}>
      <div><SectionTitle icon={Activity} k="01 / About" t="What we are" /><p className="ink" style={{ lineHeight: 1.7, fontSize: 15 }}>{s.about}</p></div>
      <Card style={{ padding: 24 }}><div className="lbl" style={{ marginBottom: 14 }}>We are good at</div>{[[Cpu, "FreeRTOS multitasking on STM32"], [Zap, "Sensorless FOC motor control"], [Gauge, "Automotive sensor interfacing"], [Wrench, "CAN telemetry & bus design"]].map(([Ic, t], i) => (<div key={i} className={i < 3 ? "divider" : ""} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}><Ic size={18} className="c-teal" /><span className="ink" style={{ fontSize: ".9rem" }}>{t}</span></div>))}</Card>
    </div></section>

    <section className="max-w-6xl mx-auto px-5" style={{ paddingBottom: 72 }}><SectionTitle icon={FolderKanban} k="02 / Our work" t="Projects we have built" /><div className="grid sm:grid-cols-3 gap-5">{s.showcase.map((c, i) => (<Card key={i} style={{ overflow: "hidden" }}>{c.video ? <VideoEmbed url={c.video} height={150} /> : <div className="gridbg divider" style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", ...(c.img ? { backgroundImage: `url(${c.img})`, backgroundSize: "cover", backgroundPosition: "center" } : {}) }}>{!c.img && <CircuitBoard size={42} style={{ color: "var(--faint)" }} />}</div>}<div style={{ padding: 18 }}><div className="disp head" style={{ fontWeight: 600 }}>{c.title}</div><div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{c.tag}</div>{c.desc && <div className="ink" style={{ fontSize: 13, marginTop: 8 }}>{c.desc}</div>}</div></Card>))}</div></section>

    {s.posts?.length > 0 && (<section className="bg2 hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 64, paddingBottom: 64 }}><SectionTitle icon={MessageSquare} k="Newsroom" t="News & updates" /><div className="hscroll">{s.posts.map((po) => (<Card key={po.id} className="postcard" style={{ overflow: "hidden" }}>{po.image ? <img src={po.image} alt={po.title} style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} /> : <div className="gridbg divider" style={{ height: 90 }} />}<div style={{ padding: 16 }}><div className="faint mono" style={{ fontSize: 11 }}>{po.date}</div><div className="disp head" style={{ fontWeight: 600, fontSize: ".98rem", margin: "4px 0 6px" }}>{po.title}</div><div className="ink" style={{ fontSize: ".82rem", lineHeight: 1.55 }}>{po.body}</div></div></Card>))}</div></div></section>)}


    {/* steps */}
    <section className="bg2 hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 72, paddingBottom: 72 }}><SectionTitle icon={ListChecks} k="03 / How it works" t="Steps to join (B.Tech & M.Tech)" /><div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">{s.steps.map((st, i) => (<div className="step" key={st.id}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><div className="stepnum">{i + 1}</div><div className="disp head" style={{ fontWeight: 600, fontSize: ".95rem" }}>{st.title}</div></div><div className="muted" style={{ fontSize: ".82rem", lineHeight: 1.5 }}>{st.desc}</div></div>))}</div></div></section>

    {/* pricing + tracks */}
    <section className="hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 56, paddingBottom: 56 }}><SectionTitle icon={Award} k="Your goal" t="The certificate you'll earn" /><div className="grid md:grid-cols-2 gap-8" style={{ alignItems: "center" }}><div style={{ position: "relative", overflow: "hidden", borderRadius: 14, border: "1px solid var(--border)" }}><div style={{ filter: "blur(2.5px)", transform: "scale(1.02)", pointerEvents: "none" }} dangerouslySetInnerHTML={{ __html: certSVG({ id: "SAMPLE0", name: "Your Name Here", email: "", track: "btech" }, new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })) }} /><div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span className="pill" style={{ background: "rgba(10,87,87,.92)", color: "#fff", fontWeight: 700, padding: "10px 18px", fontSize: ".85rem" }}>Awarded on completion</span></div></div><div><h3 className="disp head" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 10 }}>Verifiable. Shareable. Earned.</h3><p className="ink" style={{ fontSize: ".95rem", lineHeight: 1.7 }}>Every CAEE certificate carries a unique ID that employers can verify on this site, and it's backed by work they can inspect — your submitted code, projects and lab record. Add it to LinkedIn the day you finish.</p></div></div></div></section>
    <ProjectsPreview db={db} openProject={openProject} setView={setView} />
    <section className="max-w-6xl mx-auto px-5" style={{ paddingTop: 72, paddingBottom: 72 }}><SectionTitle icon={IndianRupee} k="04 / Internships & pricing" t="Choose your track" /><p className="muted" style={{ fontSize: ".95rem", marginBottom: 18, maxWidth: 640, display: "flex", alignItems: "center", gap: 8 }}><CalendarClock size={15} className="c-gold" /> Seats are limited each cohort — our hands-on hardware lab caps the batch size{reg.nextDate ? `, and the next batch opens ${reg.nextDate}` : ""}.</p><div className="grid md:grid-cols-2 gap-6">{["btech", "mtech"].map((t) => { const T = TRACK[t]; const Ic = T.icon; const pr = s.pricing[t]; return (<Card key={t} style={{ padding: 24, display: "flex", flexDirection: "column" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><span className="pill pill-green disp">{T.tag}</span><Ic size={22} className="c-teal" /></div><h3 className="disp head" style={{ fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.3, marginBottom: 12 }}>{T.name}</h3><p className="ink" style={{ fontSize: ".9rem", lineHeight: 1.6, flex: 1 }}>{T.blurb}</p><div className="divider-t" style={{ marginTop: 16, paddingTop: 16 }}>{(() => { const vs = (db.site.valueStack && db.site.valueStack[t]) || []; if (!vs.length) return null; const tot = vs.reduce((a, r) => a + (parseFloat(r.value) || 0), 0); return (<div style={{ marginBottom: 12 }}>{vs.map((r, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", padding: "3px 0" }}><span className="muted">{r.label}</span><span className="ink mono">₹{Number(r.value || 0).toLocaleString("en-IN")}</span></div>))}<div style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", fontWeight: 700, borderTop: "1px dashed var(--border)", marginTop: 4, paddingTop: 6 }}><span className="ink">Total value</span><span className="c-green mono" style={{ textDecoration: "line-through", textDecorationColor: "var(--fail)" }}>₹{tot.toLocaleString("en-IN")}</span></div><div className="faint" style={{ fontSize: 11, marginTop: 2 }}>You pay only:</div></div>); })()}<PriceTag p={pr} /><div className="faint mono" style={{ fontSize: 11, marginTop: 8 }}>{db.questions[t].length} modules · 4 projects · {T.board}</div></div><div style={{ display: "flex", gap: 8, marginTop: 14 }}><Btn kind="cta" onClick={() => setView("register")}>Enroll now <ChevronRight size={15} /></Btn><Btn kind="ghost" onClick={() => setView(t)}>View syllabus</Btn></div></Card>); })}</div></section>

    {/* talk to mentor */}
    {s.mentor && (<section className="bg2 hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 72, paddingBottom: 72 }}><SectionTitle icon={MessageSquare} k="05 / Talk to us" t="Talk to our mentor" /><Card style={{ padding: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 22 }}><div style={{ width: 88, height: 88, borderRadius: 999, background: "var(--tint)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flex: "none" }}>{s.mentor.photo ? <img src={s.mentor.photo} alt="mentor" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Users size={36} className="c-teal" />}</div><div style={{ flex: 1, minWidth: 220 }}><div className="disp head" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{s.mentor.name}</div><div className="muted" style={{ fontSize: ".85rem", marginBottom: 10 }}>{s.mentor.role}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>{s.mentor.email && <a href={`mailto:${s.mentor.email}`} className="ink" style={{ fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}><Mail size={14} className="c-green" /> {s.mentor.email}</a>}{s.mentor.phone && <a href={`tel:${s.mentor.phone}`} className="ink" style={{ fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}><Phone size={14} className="c-green" /> {s.mentor.phone}</a>}</div></div>{s.whatsapp && <a className="btn btn-primary" href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer"><MessageSquare size={15} /> WhatsApp us</a>}</Card></div></section>)}

    {s.testimonials?.length > 0 && (<section className="max-w-6xl mx-auto px-5" style={{ paddingTop: 72, paddingBottom: 72 }}><SectionTitle icon={Quote} k="06 / Voices" t="What our interns say" /><div className="grid sm:grid-cols-3 gap-5">{s.testimonials.map((t) => (<Card key={t.id} style={{ padding: 22 }}><Quote size={20} className="c-gold" /><p className="ink" style={{ fontSize: ".9rem", lineHeight: 1.6, margin: "10px 0 14px" }}>{t.quote}</p><div className="disp head" style={{ fontSize: ".85rem", fontWeight: 600 }}>{t.name}</div><div className="faint" style={{ fontSize: 12 }}>{t.role}</div></Card>))}</div></section>)}

    {s.team?.length > 0 && (<section className="bg2 hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 72, paddingBottom: 72 }}><SectionTitle icon={Users} k="07 / Team" t="Who mentors you" /><div className="grid sm:grid-cols-3 gap-5">{s.team.map((m) => (<Card key={m.id} style={{ padding: 22, textAlign: "center" }}><div style={{ width: 54, height: 54, borderRadius: 999, background: "var(--tint)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Users size={24} className="c-teal" /></div><div className="disp head" style={{ fontWeight: 600 }}>{m.name}</div><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{m.role}</div></Card>))}</div></div></section>)}

    {s.faq?.length > 0 && (<section className="max-w-3xl mx-auto px-5" style={{ paddingTop: 72, paddingBottom: 72 }}><SectionTitle icon={HelpCircle} k="08 / FAQ" t="Common questions" /><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{s.faq.map((f) => (<Card key={f.id} style={{ padding: 18 }}><div className="disp head" style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 6 }}>{f.q}</div><div className="ink" style={{ fontSize: ".875rem", lineHeight: 1.6 }}>{f.a}</div></Card>))}</div></section>)}
    <Footer setView={setView} />
  </div>);
}
const Footer = ({ setView }) => (<footer className="hero-dark"><div className="max-w-6xl mx-auto px-5" style={{ padding: "32px 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}><span className="faint" style={{ fontSize: 12 }}>© {new Date().getFullYear()} Centre for Automotive Embedded Engineering</span><div style={{ display: "flex", gap: 16, alignItems: "center" }}>{setView && <button className="navlink" style={{ padding: 0, color: "var(--faint)" }} onClick={() => setView("verify")}>Verify a certificate</button>}<span className="faint mono" style={{ fontSize: 12 }}>CAEE</span></div></div></footer>);

/* ================= TRACK PAGE (syllabus) ================= */
function TrackPage({ track, db, setView }) {
  const T = TRACK[track]; const Ic = T.icon; const qs = db.questions[track]; const projs = db.projects[track];
  const intro = db.site.trackIntro?.[track] || {}; const pr = db.site.pricing[track];
  return (<div>
    <section className="gridbg hr-b"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <BackLink onClick={() => setView("public")} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 8 }}><span className="pill pill-green disp">{T.tag} TRACK</span><Ic size={22} className="c-teal" /></div>
      <h1 className="disp head" style={{ fontSize: "min(8vw,3rem)", fontWeight: 800, lineHeight: 1.1, maxWidth: 760 }}>{T.name}</h1>
      <p className="ink" style={{ marginTop: 18, maxWidth: 700, fontSize: 15, lineHeight: 1.7 }}>{T.blurb}</p>
      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}><Btn kind="cta" onClick={() => setView("register")}>Register for this track <ChevronRight size={16} /></Btn><PriceTag p={pr} /></div>
    </div></section>

    {(intro.video || intro.image || intro.desc) && (<section className="max-w-6xl mx-auto px-5" style={{ paddingTop: 40 }}><Card style={{ padding: 18 }}><div className="grid md:grid-cols-2 gap-5" style={{ alignItems: "center" }}><div>{intro.video ? <VideoEmbed url={intro.video} height={240} /> : intro.image ? <img src={intro.image} alt="intro" style={{ width: "100%", borderRadius: 14, border: "1px solid var(--border)" }} /> : null}</div><div><div className="eyebrow" style={{ fontSize: 11, marginBottom: 6 }}>What you'll get</div><p className="ink" style={{ fontSize: ".95rem", lineHeight: 1.65 }}>{intro.desc}</p></div></div></Card></section>)}

    <section className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-10" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div><SectionTitle icon={FileCode} k="Syllabus" t={`${qs.length} modules — video lessons + real hardware lab`} /><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{qs.map((m, i) => (<div key={m.id} className="card" style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 13 }}><span className="mono c-green" style={{ fontSize: 12, width: 22 }}>{String(i + 1).padStart(2, "0")}</span><div><div className="head" style={{ fontSize: ".875rem", fontWeight: 600 }}>{m.title}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{m.c?.prompt}</div><div className="faint" style={{ fontSize: 11, marginTop: 4, display: "flex", gap: 10 }}><span><VideoIcon size={11} style={{ verticalAlign: "-1px" }} /> Video lessons</span><span><Cpu size={11} style={{ verticalAlign: "-1px" }} /> Auto-checked on real STM32 hardware</span><span><HelpCircle size={11} style={{ verticalAlign: "-1px" }} /> MCQ quiz</span></div></div></div>))}</div></div>
      <div><SectionTitle icon={FolderKanban} k="Build" t="4 hands-on projects" /><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{projs.map((p, i) => (<Card key={p.id} style={{ padding: 16 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span className="mono c-green" style={{ fontSize: 12 }}>P{i + 1}</span><span className="disp head" style={{ fontSize: ".9rem", fontWeight: 600 }}>{p.title}</span></div><p className="ink" style={{ fontSize: 12 }}>{p.desc}</p><p className="faint mono" style={{ fontSize: 11, marginTop: 8 }}>Submit: {p.submit}</p></Card>))}</div></div>
    </section>
    <Footer setView={setView} />
  </div>);
}

/* ================= REGISTER ================= */
function Register({ db, commit, setView, flash }) {
  const reg = db.site.registration || { open: true };
  const [f, setF] = useState({ name: "", email: "", phone: "", college: "", year: "3rd year", marks: "", track: "btech", why: "" });
  const [resume, setResume] = useState(null); const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const onFile = (e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > MAX_RESUME) return flash("Resume too large (max 3 MB)"); const r = new FileReader(); r.onload = () => setResume({ name: file.name, size: file.size, dataUrl: r.result }); r.readAsDataURL(file); };
  const submit = async () => {
    if (!f.name || !f.email || !f.phone) return flash("Name, email and phone are required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return flash("Enter a valid email");
    if (db.users.some((u) => u.email.toLowerCase() === f.email.toLowerCase()) || db.registrations.some((r) => r.email.toLowerCase() === f.email.toLowerCase() && r.status === "pending")) return flash("This email is already registered");
    const id = uid(); let resumeKey = null;
    if (resume) { resumeKey = `caee:resume:${id}`; try { await window.storage.set(resumeKey, resume.dataUrl, true); } catch (e) { return flash("Could not store resume"); } }
    commit({ ...db, registrations: [{ id, ...f, at: TODAY(), status: "pending", resumeKey, resumeName: resume?.name || null, resumeSize: resume?.size || null }, ...db.registrations] });
    setDone(true);
  };
  return (<div className="max-w-2xl mx-auto px-5" style={{ paddingTop: 56, paddingBottom: 56 }}>
    <div style={{ marginBottom: 24 }}><BackLink onClick={() => setView("public")} /></div>
    {!reg.open ? (<Card style={{ padding: 40, textAlign: "center" }}><CalendarClock size={42} className="c-gold" style={{ margin: "0 auto 14px" }} /><h2 className="disp head" style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 8 }}>Registrations are closed</h2><p className="muted" style={{ fontSize: ".9rem", lineHeight: 1.6 }}>{reg.nextDate ? <>The next batch opens on <b className="ink">{reg.nextDate}</b>.</> : "Please check back soon for the next batch."}{reg.note ? ` ${reg.note}` : ""}</p><div style={{ marginTop: 20 }}><Btn kind="ghost" onClick={() => setView("public")}>Back to home</Btn></div></Card>
    ) : done ? (<Card style={{ padding: 40, textAlign: "center" }}><CheckCircle2 size={46} className="c-pass" style={{ margin: "0 auto 16px" }} /><h2 className="disp head" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>Registration received</h2><p className="muted" style={{ fontSize: ".875rem" }}>We'll review your details, screen and confirm your track. After payment your course material will be unlocked and you'll get login access.</p>{(() => { const url = f.track === "mtech" ? reg.payMtech : reg.payBtech; return url ? (<div style={{ marginTop: 20 }}><a className="btn btn-cta" href={url} target="_blank" rel="noreferrer"><IndianRupee size={15} /> Pay &amp; confirm your seat</a><div className="faint" style={{ fontSize: 11, marginTop: 10, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>You will pay securely on TagMango. Once we receive your payment, we will email a one-time password to this address - use it on the Activate screen to set your password and sign in.</div></div>) : (<div className="faint" style={{ fontSize: 12, marginTop: 12 }}>Our team will email you the payment link shortly.</div>); })()}<div style={{ marginTop: 24 }}><Btn kind="ghost" onClick={() => setView("public")}>Back to home</Btn></div></Card>
    ) : (<Card style={{ padding: 28 }}><SectionTitle icon={GraduationCap} k="Internship registration" t="Register with CAEE" />
      {reg.minCgpa && <div className="note" style={{ marginBottom: 14 }}><GraduationCap size={13} style={{ verticalAlign: "-2px" }} /> Eligibility: minimum <b className="ink">{reg.minCgpa} CGPA</b>. This is for information — you can still apply.</div>}
      <Field label="Full name" icon={GraduationCap} value={f.name} onChange={set("name")} placeholder="Your name" />
      <Field label="Email (Gmail)" icon={Mail} value={f.email} onChange={set("email")} placeholder="you@gmail.com" />
      <Field label="Phone number" icon={Phone} value={f.phone} onChange={set("phone")} placeholder="+91…" />
      <Field label="College / institution" icon={Building2} value={f.college} onChange={set("college")} placeholder="e.g. RV College of Engineering" />
      <div className="grid sm:grid-cols-2 gap-3"><label style={{ display: "block", marginBottom: 12 }}><span className="lbl">Year of study</span><select value={f.year} onChange={set("year")} className="sel">{["1st year", "2nd year", "3rd year", "4th year", "M.Tech 1st", "M.Tech 2nd", "Graduated"].map((y) => <option key={y}>{y}</option>)}</select></label><Field label="Marks / CGPA" value={f.marks} onChange={set("marks")} placeholder="e.g. 8.4 CGPA" /></div>
      <label style={{ display: "block", marginBottom: 12 }}><span className="lbl">Preferred track</span><select value={f.track} onChange={set("track")} className="sel"><option value="btech">B.Tech — Smart Sensor Node</option><option value="mtech">M.Tech — Sensorless FOC</option></select></label>
      <Area label="Why do you want to do this internship?" rows={3} value={f.why} onChange={set("why")} placeholder="A few lines about your motivation…" />
      <div style={{ marginBottom: 16 }}><span className="lbl">Resume (PDF / DOC · max 3 MB)</span><label className="upload"><Upload size={18} className="c-green" /><span className="muted" style={{ fontSize: ".875rem" }}>{resume ? `${resume.name} · ${(resume.size / 1024).toFixed(0)} KB` : "Click to upload your resume"}</span><input type="file" accept=".pdf,.doc,.docx" onChange={onFile} style={{ display: "none" }} /></label></div>
      <Btn onClick={submit}>Submit registration <ChevronRight size={15} /></Btn>
    </Card>)}
  </div>);
}

/* ================= VERIFY ================= */
function Verify({ db, setView }) {
  const [id, setId] = useState(""); const [res, setRes] = useState(undefined);
  const check = () => { const t = id.trim().toUpperCase(); const u = db.users.find((x) => x.role === "student" && certId(x).toUpperCase() === t && allPassed(db, x)); setRes(u ? { ok: true, u } : { ok: false }); };
  return (<div className="max-w-md mx-auto px-5" style={{ paddingTop: 70, paddingBottom: 70 }}><Card style={{ padding: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><BadgeCheck size={22} className="c-green" /><div className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Verify a certificate</div></div>
    <p className="muted" style={{ fontSize: ".8rem", marginBottom: 16 }}>Enter the certificate ID printed on the document.</p>
    <Field label="Certificate ID" icon={BadgeCheck} value={id} onChange={(e) => setId(e.target.value)} placeholder="CAEE-B-XXXXXX" /><Btn onClick={check}>Verify</Btn>
    {res !== undefined && (res.ok ? (<div className="fbk" style={{ marginTop: 16, borderLeftColor: "var(--green)", background: "var(--passbg)" }}><div className="disp head" style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={16} className="c-pass" /> Valid certificate</div><div className="ink" style={{ fontSize: ".82rem", marginTop: 6 }}>Issued to <b>{res.u.name}</b> · {(TRACK[res.u.track] || TRACK.btech).tag} · {(TRACK[res.u.track] || TRACK.btech).name}.</div></div>) : (<div className="fbk" style={{ marginTop: 16, borderLeftColor: "var(--fail)", background: "var(--failbg)" }}><div className="c-fail" style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><X size={16} /> No matching completed certificate</div></div>))}
    <button className="navlink" style={{ padding: 0, marginTop: 16, display: "block" }} onClick={() => setView("public")}>Back to home</button>
  </Card></div>);
}

/* ================= LOGIN / FORGOT ================= */
function Login({ doLogin, setView }) {
  const [e, setE] = useState(""); const [p, setP] = useState("");
  return (<div className="max-w-md mx-auto px-5" style={{ paddingTop: 80, paddingBottom: 80 }}><Card style={{ padding: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}><div className="logo"><Lock size={20} color="#fff" /></div><div><div className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Sign in</div><div className="muted" style={{ fontSize: 12 }}>CAEE internship portal</div></div></div>
    <Field label="Email" icon={Mail} value={e} onChange={(ev) => setE(ev.target.value)} placeholder="you@gmail.com" />
    <Field label="Password" icon={Lock} type="password" value={p} onChange={(ev) => setP(ev.target.value)} placeholder="••••••••" />
    <div style={{ marginTop: 8 }}><Btn onClick={() => doLogin(e, p)}><LogIn size={15} /> Sign in</Btn></div>
    <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 12 }}><button className="navlink" style={{ padding: 0 }} onClick={() => setView("forgot")}>Forgot password?</button><button className="navlink" style={{ padding: 0 }} onClick={() => setView("public")}>Back to home</button></div>
    <button className="navlink" style={{ padding: 0, marginTop: 14, display: "block", fontSize: 12, fontWeight: 600 }} onClick={() => setView("activate")}>First time? Activate with your one-time password &rarr;</button>
    
  </Card></div>);
}
function Forgot({ db, commit, setView, flash }) {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  const submit = () => {
    const e = email.trim().toLowerCase(); const u = db.users.find((x) => x.email.toLowerCase() === e);
    if (!u) return flash("No account with that email");
    const reqs = (db.resetRequests || []).filter((r) => r.email !== e);
    commit({ ...db, resetRequests: [...reqs, { id: uid(), email: e, name: u.name, at: NOW() }] });
    setSent(true);
  };
  return (<div className="max-w-md mx-auto px-5" style={{ paddingTop: 80, paddingBottom: 80 }}><Card style={{ padding: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}><KeyRound size={22} className="c-green" /><div className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Reset password</div></div>
    {!sent ? (<>
      <p className="muted" style={{ fontSize: ".85rem", marginBottom: 16 }}>Enter your registered email. We will send a one-time password to it — you will use that to set a new password.</p>
      <Field label="Account email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" />
      <Btn onClick={submit}><Mail size={15} /> Request reset</Btn>
    </>) : (<>
      <div className="fbk" style={{ borderLeftColor: "var(--pass)", background: "var(--passbg)", marginBottom: 14 }}><CheckCircle2 size={14} className="c-pass" style={{ verticalAlign: "-2px" }} /> Request received. A one-time password will be sent to <b className="ink">{email.trim()}</b>.</div>
      <p className="muted" style={{ fontSize: ".82rem", marginBottom: 14 }}>Once you have the code, activate below and choose a new password.</p>
      <Btn onClick={() => setView("activate")}><KeyRound size={15} /> I have my one-time password</Btn>
    </>)}
    <button className="navlink" style={{ padding: 0, marginTop: 16, display: "block" }} onClick={() => setView("login")}>Back to sign in</button>
  </Card></div>);
}

/* ================= STUDENT PORTAL (protected) ================= */
function useProtect(active) {
  useEffect(() => {
    if (!active) return;
    const isField = (t) => t && /INPUT|TEXTAREA/.test(t.tagName);
    const noCtx = (e) => e.preventDefault();
    const noCopy = (e) => { if (!isField(e.target)) e.preventDefault(); };
    const onKey = (e) => { if (e.key === "PrintScreen") { try { navigator.clipboard.writeText(""); } catch (x) {} } if ((e.ctrlKey || e.metaKey) && ["c", "s", "p", "u"].includes((e.key || "").toLowerCase()) && !isField(e.target)) e.preventDefault(); };
    const noDrag = (e) => e.preventDefault();
    document.addEventListener("contextmenu", noCtx); document.addEventListener("copy", noCopy); document.addEventListener("keydown", onKey); document.addEventListener("dragstart", noDrag);
    return () => { document.removeEventListener("contextmenu", noCtx); document.removeEventListener("copy", noCopy); document.removeEventListener("keydown", onKey); document.removeEventListener("dragstart", noDrag); };
  }, [active]);
}
function Watermark({ text }) { return (<div className="wm">{Array.from({ length: 60 }).map((_, i) => <span key={i}>{text} · CAEE confidential</span>)}</div>); }
function heuristicScan(code, rules) {
  const c = code || ""; const findings = [];
  const builtin = [
    [/\bsystem\s*\(/, "Calls system() — can run arbitrary shell commands", "high"],
    [/\b(popen|execl|execlp|execle|execv|execvp|execve|posix_spawn)\s*\(/, "Process / shell execution call", "high"],
    [/\bsocket\s*\(|\bconnect\s*\(/, "Network / socket activity", "high"],
  ];
  for (const [re, msg, risk] of builtin) if (re.test(c)) findings.push({ msg, risk });
  for (const r of (rules || [])) { if (!r?.pattern) continue; try { const re = new RegExp(r.pattern, r.flags || ""); if (re.test(c)) findings.push({ msg: r.msg || r.pattern, risk: r.risk || "medium" }); } catch (e) { /* skip invalid regex */ } }
  const order = { none: 0, low: 1, medium: 2, high: 3 };
  const risk = findings.reduce((m, f) => (order[f.risk] || 0) > (order[m] || 0) ? f.risk : m, "none");
  return { risk, findings: [...new Set(findings.map((f) => f.msg))] };
}
let AI_KEY = "";
function setAiKey(k) { AI_KEY = (k || "").trim(); }
function aiHdrs() { const h = { "Content-Type": "application/json" }; if (AI_KEY) { h["x-api-key"] = AI_KEY; h["anthropic-version"] = "2023-06-01"; h["anthropic-dangerous-direct-browser-access"] = "true"; } return h; }
async function securityScan(code, rules) {
  const h = heuristicScan(code, rules);
  let ai = { risk: "none", malicious: false, findings: [], summary: "" };
  try {
    const sys = `You are a security analyst screening C / embedded-firmware source that will be flashed to a microcontroller on a private engineer's lab PC and hardware. Flag genuine threats in TWO categories: (1) host/malware — shell/command execution, networking or data exfiltration, file deletion, host OS or Windows-registry access, obfuscated payloads, shellcode, fork bombs; (2) hardware-damage — disabling timer dead-time or the break/over-current input, forcing complementary PWM channels (shoot-through), 100% PWM duty into a motor (stall/over-current), modifying option bytes / read-out protection (bricking), disabling the watchdog. Normal embedded patterns (volatile register writes, HAL/CMSIS calls, peripheral pointers, math, lookup tables, ordinary PWM) are SAFE.
Respond with ONLY JSON, no markdown: {"risk":"none|low|medium|high","malicious":true|false,"findings":["short item"],"summary":"one line"}`;
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: aiHdrs(), body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, system: sys, messages: [{ role: "user", content: (code || "").slice(0, 12000) }] }) });
    const data = await r.json();
    const txt = (data.content || []).filter((i) => i.type === "text").map((i) => i.text).join("").trim();
    ai = JSON.parse(txt.replace(/```json|```/g, "").trim());
  } catch (e) { /* AI unreachable — fall back to heuristics only */ }
  const order = { none: 0, low: 1, medium: 2, high: 3 };
  const risk = (order[h.risk] ?? 0) >= (order[ai.risk] ?? 0) ? h.risk : ai.risk;
  const malicious = !!ai.malicious || h.risk === "high";
  const findings = [...new Set([...h.findings, ...(ai.findings || [])])];
  const clean = !malicious && (order[risk] ?? 0) <= 1;
  return { clean, risk, malicious, findings, summary: ai.summary || "", at: NOW() };
}
const REVIEW_MIN_H = 6, REVIEW_MAX_H = 8;
const reviewDue = () => Date.now() + (REVIEW_MIN_H + Math.random() * (REVIEW_MAX_H - REVIEW_MIN_H)) * 3600000;
async function genMCQs(title, context, kind) {
  try {
    const sys = `You write multiple-choice INTERVIEW questions testing understanding of an embedded / ${kind === "mtech" ? "motor-control (FOC)" : "automotive embedded"} engineering module. Produce EXACTLY 20 questions of mixed difficulty, each with 4 plausible options and exactly one correct answer. Respond with ONLY a JSON array, no markdown: [{"q":"...","options":["a","b","c","d"],"answer":0,"explain":"one short line"}]`;
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: aiHdrs(), body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: sys, messages: [{ role: "user", content: `Module: ${title}\nContext: ${context}` }] }) });
    const data = await r.json();
    const txt = (data.content || []).filter((i) => i.type === "text").map((i) => i.text).join("").trim();
    const arr = JSON.parse(txt.replace(/```json|```/g, "").trim());
    return arr.filter((x) => x && x.q && Array.isArray(x.options) && x.options.length >= 2).map((x) => ({ id: uid(), q: x.q, options: x.options.slice(0, 4), answer: Math.max(0, Math.min(3, x.answer | 0)), explain: x.explain || "" }));
  } catch (e) { return null; }
}
function AccessPending() {
  return (<div className="max-w-lg mx-auto px-5" style={{ paddingTop: 80 }}><Card style={{ padding: 36, textAlign: "center" }}><Lock size={34} className="c-gold" style={{ margin: "0 auto 14px" }} /><h2 className="disp head" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>Course access pending</h2><p className="muted" style={{ fontSize: ".9rem", lineHeight: 1.6 }}>Your account is active, but your course material hasn't been unlocked yet. Once your payment and enrolment are confirmed, your mentor will grant access.</p></Card></div>);
}
function ReviewBox({ s }) {
  if (!s || !s.reviewStatus) return null;
  const now = Date.now(); const due = s.reviewDueAt && now >= s.reviewDueAt;
  return (<div className="card" style={{ padding: 14, borderColor: "var(--border2)", background: "rgba(31,139,139,.05)" }}>
    <div className="lbl" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--teal)", marginBottom: 6 }}><MessageSquare size={12} /> Project Lead review</div>
    {s.review ? (<div className="ink" style={{ fontSize: ".82rem", whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{s.review}<div className="faint" style={{ fontSize: 11, marginTop: 8 }}>Feedback on how to improve — not the solution.</div></div>)
      : !due ? (<div className="muted" style={{ fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6 }}><Hourglass size={13} /> Your project lead's review will appear about {Math.max(1, Math.ceil((s.reviewDueAt - now) / 3600000))}h after you submitted.</div>)
        : (<div className="muted" style={{ fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6 }}><Hourglass size={13} /> Your project lead is reviewing your submission… check back shortly.</div>)}
  </div>);
}
function genOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }
function Activate({ doActivate, setView }) {
  const [e, setE] = useState(""); const [o, setO] = useState(""); const [ph, setPh] = useState("");
  return (<div className="max-w-md mx-auto px-5" style={{ paddingTop: 80, paddingBottom: 80 }}><Card style={{ padding: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><KeyRound size={22} className="c-green" /><div className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Activate your account</div></div>
    <p className="muted" style={{ fontSize: ".85rem", marginBottom: 18 }}>Enter the email you used to buy the internship and the one-time password sent to it. You will then set your own password.</p>
    <Field label="Registered email" icon={Mail} value={e} onChange={(ev) => setE(ev.target.value)} placeholder="you@gmail.com" />
    <Field label="Phone number (WhatsApp preferred)" icon={Phone} value={ph} onChange={(ev) => setPh(ev.target.value)} placeholder="+91 …" />
    <Field label="One-time password" icon={Lock} value={o} onChange={(ev) => setO(ev.target.value)} placeholder="One-time code from your email" />
    <div style={{ marginTop: 8 }}><Btn onClick={() => doActivate(e, o, ph)}><LogIn size={15} /> Continue</Btn></div>
    <button className="navlink" style={{ padding: 0, marginTop: 16, display: "block" }} onClick={() => setView("login")}>Back to sign in</button>
  </Card></div>);
}
function itemMedia(item, legacyPdfKey) {
  if (Array.isArray(item.media)) return item.media;
  const out = []; const v = item.video || item.videoUrl;
  if (v) out.push({ id: item.id + "-v", kind: "video", url: v, title: "Video" });
  if (item.pdfName) out.push({ id: item.id + "-p", kind: "pdf", key: legacyPdfKey, name: item.pdfName, title: "Notes" });
  return out;
}
function MediaManager({ media, onChange, flash }) {
  const list = media || []; const [vurl, setVurl] = useState("");
  const [vtitle, setVtitle] = useState("");
  const addVideo = () => { const u = vurl.trim(); if (!u) return flash && flash("Paste a video URL"); onChange([...list, { id: uid(), kind: "video", url: u, title: vtitle.trim() || "Video" }]); setVurl(""); setVtitle(""); };
  const addPdf = (file) => { if (!file) return; if (file.type !== "application/pdf") return flash && flash("PDF files only"); if (file.size > 8 * 1024 * 1024) return flash && flash("PDF too large (max 8 MB)"); const mid = uid(); const key = `caee:media:${mid}`; const rd = new FileReader(); rd.onload = async () => { try { await window.storage.set(key, rd.result, true); onChange([...list, { id: mid, kind: "pdf", key, name: file.name, title: "Notes" }]); flash && flash("PDF uploaded"); } catch (x) { flash && flash("Could not save PDF"); } }; rd.readAsDataURL(file); };
  const [showTextBox, setShowTextBox] = useState(false);
  const [textTitle, setTextTitle] = useState(""); const [textBody, setTextBody] = useState("");
  const addText = () => { const b = textBody.trim(); if (!b) return flash && flash("Write some text first"); onChange([...list, { id: uid(), kind: "text", title: textTitle.trim() || "Note", body: b }]); setTextTitle(""); setTextBody(""); setShowTextBox(false); };
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= list.length) return; const a = list.slice(); const t = a[i]; a[i] = a[j]; a[j] = t; onChange(a); };
  const del = (i) => { onChange(list.filter((_, k) => k !== i)); }; // file itself is kept in storage so Undo / Discard / version restore can bring it back
  const setTitle = (i, val) => onChange(list.map((it, k) => k === i ? { ...it, title: val } : it));
  return (<div>
    {list.length > 0 && (<div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>{list.map((it, i) => (<div key={it.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid var(--border)", borderRadius: 9, padding: "5px 8px" }}>
      {it.kind === "video" ? <VideoIcon size={14} className="c-teal" /> : it.kind === "text" ? <Edit3 size={14} className="c-gold" /> : <FileText size={14} className="c-green" />}
      <input className="input" style={{ flex: 1, padding: "4px 8px", fontSize: ".8rem" }} value={it.title || ""} onChange={(e) => setTitle(i, e.target.value)} placeholder={it.kind === "video" ? "Video label" : "Notes label"} />
      <span className="faint" style={{ fontSize: 11, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={it.kind === "video" ? it.url : it.kind === "text" ? it.body : it.name}>{it.kind === "video" ? it.url : it.kind === "text" ? it.body : it.name}</span>
      <button className="iconbtn" style={{ width: 24, height: 24, fontSize: 13 }} title="Move up" onClick={() => move(i, -1)} disabled={i === 0}>&#8593;</button>
      <button className="iconbtn" style={{ width: 24, height: 24, fontSize: 13 }} title="Move down" onClick={() => move(i, 1)} disabled={i === list.length - 1}>&#8595;</button>
      <button className="iconbtn" style={{ width: 24, height: 24 }} title="Remove" onClick={() => del(i)}><Trash2 size={12} /></button>
    </div>))}</div>)}
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      <input className="input" style={{ flex: 1, minWidth: 170 }} value={vurl} onChange={(e) => setVurl(e.target.value)} placeholder="Paste a video URL (YouTube/Vimeo/MP4)" onKeyDown={(e) => { if (e.key === "Enter") addVideo(); }} />
      <input className="input" style={{ width: 140 }} value={vtitle} onChange={(e) => setVtitle(e.target.value)} placeholder="Label (optional)" onKeyDown={(e) => { if (e.key === "Enter") addVideo(); }} />
      <Btn sm kind="ghost" onClick={addVideo}><Plus size={13} /> Add video</Btn>
      <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}><FileText size={13} /> Add PDF<input type="file" accept="application/pdf" onChange={(e) => { addPdf(e.target.files && e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} /></label>
      <Btn sm kind="ghost" onClick={() => setShowTextBox(!showTextBox)}><Edit3 size={13} /> Add text</Btn>
    </div>
    {showTextBox && (<div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      <input className="input" value={textTitle} onChange={(e) => setTextTitle(e.target.value)} placeholder="Note title (optional)" />
      <textarea className="input" rows={4} value={textBody} onChange={(e) => setTextBody(e.target.value)} placeholder="Write the note text students will see" />
      <div style={{ display: "flex", gap: 6 }}><Btn sm onClick={addText}><Plus size={13} /> Save note</Btn><Btn sm kind="ghost" onClick={() => setShowTextBox(false)}>Cancel</Btn></div>
    </div>)}
  </div>);
}
let _ytApiPromise = null;
function loadYouTubeAPI() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (_ytApiPromise) return _ytApiPromise;
  _ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
    if (!document.getElementById("caee-yt-api")) {
      const tag = document.createElement("script");
      tag.id = "caee-yt-api"; tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return _ytApiPromise;
}
function YouTubeResumePlayer({ videoId, startSeconds, onProgress, height }) {
  const divRef = useRef(null); const playerRef = useRef(null); const pollRef = useRef(null); const idRef = useRef("ytp_" + uid());
  const [apiFailed, setApiFailed] = useState(false); const [apiReady, setApiReady] = useState(false);
  useEffect(() => {
    let cancelled = false; let settled = false;
    const timeout = setTimeout(() => { if (!settled) { settled = true; if (!cancelled) setApiFailed(true); } }, 5000);
    loadYouTubeAPI().then((YT) => {
      if (settled || cancelled) return; settled = true; clearTimeout(timeout);
      if (!YT || !divRef.current) { setApiFailed(true); return; }
      setApiReady(true);
      playerRef.current = new YT.Player(divRef.current, {
        videoId, height: "100%", width: "100%",
        playerVars: { start: Math.max(0, Math.floor(startSeconds || 0)), enablejsapi: 1, rel: 0 },
        events: {
          onError: () => setApiFailed(true),
          onStateChange: (e) => {
            if (e.data === 1) { // playing
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = setInterval(() => {
                try { const t = playerRef.current.getCurrentTime(); const d = playerRef.current.getDuration();
                  onProgress && onProgress(t, d); } catch (er) {}
              }, 4000);
            } else if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null;
              try { const t = playerRef.current.getCurrentTime(); const d = playerRef.current.getDuration();
                onProgress && onProgress(t, d); } catch (er) {}
            }
          },
        },
      });
    }).catch(() => { if (!settled) { settled = true; clearTimeout(timeout); setApiFailed(true); } });
    return () => { cancelled = true; clearTimeout(timeout); if (pollRef.current) clearInterval(pollRef.current);
      try { playerRef.current && playerRef.current.destroy && playerRef.current.destroy(); } catch (er) {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);
  if (apiFailed) {
    // graceful fallback: plain embed, still resumes to the right second via the URL param, just without live position tracking
    const s = Math.max(0, Math.floor(startSeconds || 0));
    return <div className="mediaframe"><iframe loading="lazy" src={`https://www.youtube.com/embed/${videoId}${s > 0 ? `?start=${s}` : ""}`} style={{ width: "100%", height, border: 0, display: "block" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="video" /></div>;
  }
  return <div className="mediaframe"><div ref={divRef} id={idRef.current} style={{ width: "100%", height, background: apiReady ? "transparent" : "#0a1420" }} /></div>;
}
function NativeResumeVideo({ url, startSeconds, onProgress, height }) {
  const ref = useRef(null); const lastSaveRef = useRef(0);
  const onLoaded = () => { if (ref.current && startSeconds > 1) { try { ref.current.currentTime = startSeconds; } catch (e) {} } };
  const onTime = () => { const v = ref.current; if (!v) return; const now = Date.now();
    if (now - lastSaveRef.current > 4000) { lastSaveRef.current = now; onProgress && onProgress(v.currentTime, v.duration || 0); } };
  const onPause = () => { const v = ref.current; if (v) onProgress && onProgress(v.currentTime, v.duration || 0); };
  return <div className="mediaframe"><video ref={ref} src={url} controls controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} style={{ width: "100%", height, display: "block", background: "#000" }}
    onLoadedMetadata={onLoaded} onTimeUpdate={onTime} onPause={onPause} onEnded={onPause} /></div>;
}
function fmtClock(s) { s = Math.max(0, Math.floor(s || 0)); const m = Math.floor(s / 60), ss = s % 60; return m + ":" + (ss < 10 ? "0" : "") + ss; }
function ModuleMedia({ item, moduleId, db, commit, me, legacyPdfKey, flash, height = 280, emptyLabel }) {
  const list = itemMedia(item, legacyPdfKey);
  const videos = list.filter((it) => it.kind === "video");
  const others = list.filter((it) => it.kind !== "video" && it.kind !== "text");
  const notes = list.filter((it) => it.kind === "text");
  const [openPdf, setOpenPdf] = useState({});
  const viewPdf = async (it) => {
    if (openPdf[it.id]) { setOpenPdf((p) => { const n = { ...p }; delete n[it.id]; return n; }); return; }
    try {
      const r = await window.storage.get(it.key, true);
      if (!r || !r.value) return flash && flash("File not available yet");
      setOpenPdf((p) => ({ ...p, [it.id]: r.value }));
      if (canTrack) saveProgress(it.id, 1, 1);
    } catch (e) { flash && flash("Could not load file"); }
  };
  const canTrack = !!(me && moduleId && commit);
  const vp = canTrack ? ((db.videoProgress || {})[me.id] || {})[moduleId] || {} : {};
  const [activeId, setActiveId] = useState(() => {
    if (vp.lastMediaId && videos.some((v) => v.id === vp.lastMediaId)) return vp.lastMediaId;
    return videos[0]?.id;
  });
  const active = videos.find((v) => v.id === activeId) || videos[0];
  const activeProg = active ? (vp.items || {})[active.id] : null;
  const saveProgress = (mediaId, seconds, duration) => {
    if (!canTrack) return;
    const nextAll = { ...(db.videoProgress || {}) };
    const mine = { ...(nextAll[me.id] || {}) };
    const mod = { ...(mine[moduleId] || {}) };
    const items = { ...(mod.items || {}) };
    items[mediaId] = { seconds, duration, updatedAt: NOW() };
    mine[moduleId] = { lastMediaId: mediaId, items };
    nextAll[me.id] = mine;
    commit({ ...db, videoProgress: nextAll });
  };
  const selectTab = (v) => { setActiveId(v.id); if (canTrack) saveProgress(v.id, ((vp.items || {})[v.id]?.seconds) || 0, ((vp.items || {})[v.id]?.duration) || 0); };
  if (list.length === 0) return emptyLabel ? (<div className="gridbg divider" style={{ height: 150, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><span className="faint" style={{ fontSize: 13 }}>{emptyLabel}</span></div>) : null;
  const resumeFrac = activeProg && activeProg.duration > 30 ? activeProg.seconds / activeProg.duration : 0;
  const showResume = activeProg && activeProg.seconds > 8 && resumeFrac < 0.95;
  return (<div style={{ marginBottom: 16 }}>
    {videos.length > 0 && (<div>
      {videos.length > 1 && (<div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>{videos.map((v, i) => { const p = (vp.items || {})[v.id]; const f = p && p.duration > 30 ? p.seconds / p.duration : 0;
        return (<button key={v.id} className={`toggle ${activeId === v.id ? "on" : ""}`} onClick={() => selectTab(v)}>{f >= 0.95 ? <CheckCircle2 size={11} className="c-pass" /> : null} {v.title && v.title !== "Video" ? v.title : `Video ${i + 1}`}</button>); })}</div>)}
      {active && (<div key={active.id}>
        {active.title && active.title !== "Video" && videos.length === 1 && <div className="lbl" style={{ marginBottom: 4 }}>{active.title}</div>}
        {showResume && (<div className="note" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}><Play size={13} className="c-teal" /> Continuing from {fmtClock(activeProg.seconds)} — where you left off last session.</div>)}
        {(() => { const yt = active.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]+)/);
          if (yt && canTrack) return <YouTubeResumePlayer videoId={yt[1]} startSeconds={activeProg?.seconds || 0} height={height} onProgress={(s, d) => saveProgress(active.id, s, d)} />;
          if (!yt && /\.(mp4|webm|ogg)(\?|$)/i.test(active.url) && canTrack) return <NativeResumeVideo url={active.url} startSeconds={activeProg?.seconds || 0} height={height} onProgress={(s, d) => saveProgress(active.id, s, d)} />;
          return <VideoEmbed url={active.url} height={height} />; })()}
      </div>)}
    </div>)}
    {notes.length > 0 && (<div style={{ marginTop: videos.length ? 10 : 0, display: "flex", flexDirection: "column", gap: 10 }}>{notes.map((it) => { const read = !!(vp.items || {})[it.id]; return (<div key={it.id} className="card" style={{ padding: 14 }}>{it.title && it.title !== "Note" && <div className="lbl" style={{ marginBottom: 6 }}>{it.title}</div>}<div style={{ fontSize: ".875rem", whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: canTrack ? 10 : 0 }}>{it.body}</div>{canTrack && (read ? <span className="pill pill-green" style={{ fontSize: 11 }}><CheckCircle2 size={11} /> Read</span> : <Btn sm kind="ghost" onClick={() => saveProgress(it.id, 1, 1)}><CheckCircle2 size={13} /> Mark as read</Btn>)}</div>); })}</div>)}
    {others.length > 0 && (<div style={{ marginTop: (videos.length || notes.length) ? 10 : 0, display: "flex", flexDirection: "column", gap: 8 }}>{others.map((it) => (<div key={it.id}>
      <Btn kind="ghost" sm onClick={() => viewPdf(it)}><FileText size={13} /> {openPdf[it.id] ? "Hide" : "View"} {it.title && it.title !== "Notes" ? it.title : "notes (PDF)"}{it.name && !openPdf[it.id] ? ` · ${it.name}` : ""}</Btn>
      {openPdf[it.id] && (<div style={{ marginTop: 8, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}><iframe src={openPdf[it.id] + "#toolbar=0&navpanes=0"} style={{ width: "100%", height: 520, border: 0, display: "block" }} title={it.title || "PDF"} /></div>)}
    </div>))}</div>)}
  </div>);
}
function MediaViewer({ item, legacyPdfKey, flash, height = 280, emptyLabel }) {
  const list = itemMedia(item, legacyPdfKey);
  const [openPdf, setOpenPdf] = useState({});
  const viewPdf = async (it) => {
    if (openPdf[it.id]) { setOpenPdf((p) => { const n = { ...p }; delete n[it.id]; return n; }); return; }
    try {
      const r = await window.storage.get(it.key, true);
      if (!r || !r.value) return flash && flash("File not available yet");
      setOpenPdf((p) => ({ ...p, [it.id]: r.value }));
    } catch (e) { flash && flash("Could not load file"); }
  };
  if (list.length === 0) return emptyLabel ? (<div className="gridbg divider" style={{ height: 150, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><span className="faint" style={{ fontSize: 13 }}>{emptyLabel}</span></div>) : null;
  return (<div style={{ marginBottom: 16 }}>{list.map((it) => (<div key={it.id} style={{ marginBottom: 10 }}>
    {it.kind === "video" ? (<div>{it.title && it.title !== "Video" && <div className="lbl" style={{ marginBottom: 4 }}>{it.title}</div>}<VideoEmbed url={it.url} height={height} /></div>) : (<div>
      <Btn kind="ghost" sm onClick={() => viewPdf(it)}><FileText size={13} /> {openPdf[it.id] ? "Hide" : "View"} {it.title && it.title !== "Notes" ? it.title : "notes (PDF)"}{it.name && !openPdf[it.id] ? ` · ${it.name}` : ""}</Btn>
      {openPdf[it.id] && (<div style={{ marginTop: 8, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}><iframe src={openPdf[it.id] + "#toolbar=0&navpanes=0"} style={{ width: "100%", height: 520, border: 0, display: "block" }} title={it.title || "PDF"} /></div>)}
    </div>)}
  </div>))}</div>);
}
function projList(db) { return (db.site.projects || []); }
function ProjectCard({ p, onOpen }) {
  return (<button onClick={onOpen} style={{ textAlign: "left", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 150, background: p.cover ? `#0e1f1d url(${p.cover}) center/cover no-repeat` : "linear-gradient(135deg,#0A5757,#2BA665)", display: "flex", alignItems: "flex-end" }}>{p.tag && <span className="pill pill-green disp" style={{ margin: 10 }}>{p.tag}</span>}</div>
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <div className="disp head" style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.3 }}>{p.title}</div>
      <div className="muted" style={{ fontSize: ".82rem", lineHeight: 1.5, flex: 1 }}>{p.blurb}</div>
      <div className="c-green" style={{ fontSize: ".8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>Read experiment <ChevronRight size={14} /></div>
    </div>
  </button>);
}
function NewsletterSignup({ db, commit, flash, compact }) {
  const [email, setEmail] = useState("");
  const sub = () => { const e = email.trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return flash && flash("Enter a valid email"); const subs = db.site.subscribers || []; if (subs.some((x) => x.email === e)) { setEmail(""); return flash && flash("You are already subscribed"); } commit({ ...db, site: { ...db.site, subscribers: [...subs, { email: e, at: NOW() }] } }); setEmail(""); flash && flash("Subscribed - thanks!"); };
  return (<div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: compact ? "flex-start" : "center" }}>
    <input className="input" style={{ maxWidth: 280 }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={(e) => { if (e.key === "Enter") sub(); }} />
    <Btn kind="cta" onClick={sub}><Mail size={14} /> Get new experiments</Btn>
  </div>);
}
function ProjectsPreview({ db, openProject, setView }) {
  const items = projList(db).filter((p) => p.published).slice(0, 3);
  if (items.length === 0) return null;
  return (<section className="bg2 hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 56, paddingBottom: 56 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
      <SectionTitle icon={Sparkles} k="Lab notes" t="STM32 projects & experiments" />
      <button className="navlink" style={{ fontWeight: 600 }} onClick={() => setView("projects")}>View all experiments <ChevronRight size={14} /></button>
    </div>
    <div className="grid md:grid-cols-3 gap-6" style={{ marginTop: 8 }}>{items.map((p) => <ProjectCard key={p.id} p={p} onOpen={() => openProject(p.id)} />)}</div>
  </div></section>);
}
function ProjectsFeed({ db, commit, flash, openProject, setView }) {
  const items = projList(db).filter((p) => p.published);
  return (<div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 72 }}>
    <button className="navlink" style={{ marginBottom: 12 }} onClick={() => setView("public")}><ChevronRight size={14} style={{ transform: "rotate(180deg)", verticalAlign: "-2px" }} /> Home</button>
    <SectionTitle icon={Sparkles} k="Lab notes" t="STM32 projects & experiments" />
    <p className="muted" style={{ fontSize: ".95rem", maxWidth: 640, marginBottom: 20 }}>Hands-on builds and experiments on STM32 - sensors, CAN, motor control and more. Each one is a full write-up you can follow.</p>
    <Card style={{ padding: 18, marginBottom: 24 }}><div className="disp head" style={{ fontWeight: 700, marginBottom: 4 }}>Get new experiments in your inbox</div><p className="muted" style={{ fontSize: ".82rem", marginBottom: 12 }}>We publish new STM32 builds regularly. No spam.</p><NewsletterSignup db={db} commit={commit} flash={flash} compact /></Card>
    {items.length === 0 ? <div className="faint" style={{ textAlign: "center", padding: "40px 0" }}>No experiments published yet - check back soon.</div> :
      <div className="grid md:grid-cols-3 gap-6">{items.map((p) => <ProjectCard key={p.id} p={p} onOpen={() => openProject(p.id)} />)}</div>}
  </div>);
}
function ProjectPage({ db, projId, setView, openProject }) {
  const p = projList(db).find((x) => x.id === projId);
  if (!p) return (<div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 60 }}><p className="muted">Experiment not found.</p><Btn kind="ghost" onClick={() => setView("projects")}>Back to experiments</Btn></div>);
  const more = projList(db).filter((x) => x.published && x.id !== p.id).slice(0, 3);
  return (<div className="max-w-4xl mx-auto px-5" style={{ paddingTop: 32, paddingBottom: 72 }}>
    <button className="navlink" style={{ marginBottom: 16 }} onClick={() => setView("projects")}><ChevronRight size={14} style={{ transform: "rotate(180deg)", verticalAlign: "-2px" }} /> All experiments</button>
    {p.tag && <span className="pill pill-green disp">{p.tag}</span>}
    <h1 className="disp head" style={{ fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.2, margin: "10px 0 8px" }}>{p.title}</h1>
    {p.blurb && <p className="muted" style={{ fontSize: "1rem", marginBottom: 18 }}>{p.blurb}</p>}
    {p.cover && <img src={p.cover} alt="" style={{ width: "100%", borderRadius: 14, marginBottom: 18 }} />}
    <MediaViewer item={p} legacyPdfKey={""} flash={() => {}} height={360} />
    {p.body && <div className="ink" style={{ fontSize: "1rem", lineHeight: 1.7, whiteSpace: "pre-wrap", marginTop: 8 }}>{p.body}</div>}
    <Card style={{ padding: 22, marginTop: 28, textAlign: "center", background: "linear-gradient(135deg, rgba(10,87,87,.06), rgba(43,166,101,.06))" }}>
      <div className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}>Want to build this yourself?</div>
      <p className="muted" style={{ fontSize: ".9rem", marginBottom: 14 }}>Learn it hands-on with real STM32 hardware in the CAEE internship.</p>
      <Btn kind="cta" onClick={() => setView("register")}>Join the internship <ChevronRight size={15} /></Btn>
    </Card>
    {more.length > 0 && (<div style={{ marginTop: 36 }}><div className="lbl" style={{ marginBottom: 12 }}>More experiments</div><div className="grid md:grid-cols-3 gap-6">{more.map((x) => <ProjectCard key={x.id} p={x} onOpen={() => openProject(x.id)} />)}</div></div>)}
  </div>);
}
function CheckinsPanel({ db, commit, flash, who }) {
  const [busy, setBusy] = useState(false);
  const [risks, setRisks] = useState(() => computeRiskList(db));
  const drafts = db.checkins || {};

  const generate = async () => {
    setBusy(true);
    const list = computeRiskList(db);
    setRisks(list);
    const already = db.checkins || {};
    let next = { ...already };
    for (const r of list) {
      if (already[r.u.id] && already[r.u.id].status !== "dismissed" && daysBetween(already[r.u.id].generatedAt, NOW()) < 6) continue;
      const draft = await aiDraftCheckin(r);
      next = { ...next, [r.u.id]: { generatedAt: NOW(), reason: r.reason, meta: r, draft: draft || "Could not generate a draft — write one manually below.", status: "draft" } };
    }
    commit({ ...db, checkins: next, audit: auditPush(db, `Generated weekly check-ins (${list.length} flagged)`, who) });
    setBusy(false);
    flash(list.length ? `${list.length} student(s) flagged — drafts ready below` : "Nobody is showing risk signals this week");
  };

  const setDraft = (uid, text) => commit({ ...db, checkins: { ...drafts, [uid]: { ...drafts[uid], draft: text } } });
  const markSent = (uid) => {
    const text = drafts[uid]?.draft || "";
    navigator.clipboard?.writeText(text).catch(() => {});
    commit({ ...db, checkins: { ...drafts, [uid]: { ...drafts[uid], status: "sent", sentAt: NOW() } }, audit: auditPush(db, `Check-in copied/sent · ${(db.users.find((x) => x.id === uid) || {}).name}`, who) });
    flash("Copied to clipboard — paste it into WhatsApp, email, or wherever you reach them");
  };
  const dismiss = (uid) => commit({ ...db, checkins: { ...drafts, [uid]: { ...drafts[uid], status: "dismissed" } } });

  const activeIds = Object.keys(drafts).filter((id) => drafts[id] && drafts[id].status !== "dismissed");

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
      <div className="muted" style={{ fontSize: ".85rem", maxWidth: 560 }}>Scans for students who have gone quiet AND fallen behind pace, or have a reworked project sitting untouched. AI drafts a specific, low-pressure note for each — nothing is sent automatically; you review, edit, and copy it yourself.</div>
      <Btn onClick={generate} disabled={busy}>{busy ? "Scanning & drafting…" : "Generate this week's check-ins"}</Btn>
    </div>
    {activeIds.length === 0 && <Empty msg="No check-ins yet. Press Generate to scan for students who may need a nudge." />}
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {activeIds.map((uid) => {
        const d = drafts[uid]; const u = db.users.find((x) => x.id === uid); if (!u) return null;
        const reasonLabel = d.reason === "stuck_project" ? "project sent back, no resubmission" : `quiet ${d.meta?.daysQuiet ?? "?"}d · ${d.meta?.modulesBehind ?? "?"} module(s) behind pace`;
        return (<Card key={uid} style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <div><span className="ink" style={{ fontWeight: 700 }}>{u.name}</span><span className="faint" style={{ fontSize: 11, marginLeft: 8 }}>{u.email} · {u.track === "mtech" ? "M.Tech" : "B.Tech"}</span></div>
            <span className={`badge ${d.status === "sent" ? "b-approved" : "b-pending"}`}>{d.status === "sent" ? "sent" : reasonLabel}</span>
          </div>
          <textarea className="input" style={{ width: "100%", minHeight: 84, fontSize: ".85rem" }} value={d.draft} onChange={(e) => setDraft(uid, e.target.value)} />
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <Btn onClick={() => markSent(uid)}><Copy size={14} /> Copy &amp; mark sent</Btn>
            <Btn kind="ghost" onClick={() => dismiss(uid)}>Dismiss</Btn>
          </div>
          {d.sentAt && <div className="faint" style={{ fontSize: 11, marginTop: 6 }}>Marked sent {new Date(d.sentAt).toLocaleString()}</div>}
        </Card>); })}
    </div>
  </div>);
}
function ProjectApprovals({ db, commit, flash, who }) {
  const [open, setOpen] = useState(null);
  const students = db.users.filter((u) => u.role === "student" && u.track);
  const setSub = (uid, pid, patch) => { const all = db.projectSubs || {}; const mine = all[uid] || {};
    commit({ ...db, projectSubs: { ...all, [uid]: { ...mine, [pid]: { ...(mine[pid] || {}), ...patch } } },
      audit: auditPush(db, `${patch.approved ? "Approved" : "Reopened"} ${pid} · ${(db.users.find((x) => x.id === uid) || {}).name}`, who) }); };
  return (<div>
    <div className="muted" style={{ fontSize: ".85rem", marginBottom: 14 }}>Tick each project once you are satisfied with it. When every project for a student is approved, their certificate is released.</div>
    <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Student</th><th>Track</th>
      {["p1", "p2", "p3", "p4"].map((p) => <th key={p} style={{ textAlign: "center" }}>{p.toUpperCase()}</th>)}
      <th>Certificate</th></tr></thead><tbody>
      {students.map((u) => { const ps = (db.projectSubs || {})[u.id] || {}; const ids = Object.keys(PROJ_TITLES[u.track] || {});
        const allOk = ids.length > 0 && ids.every((p) => ps[p] && ps[p].approved);
        return (<tr key={u.id}>
          <td>{u.name}<div className="faint" style={{ fontSize: 11 }}>{u.email}</div></td>
          <td><span className="pill">{u.track === "mtech" ? "M.Tech" : "B.Tech"}</span></td>
          {["p1", "p2", "p3", "p4"].map((pid) => { const has = ids.indexOf(pid) >= 0; const sub = ps[pid];
            if (!has) return <td key={pid} style={{ textAlign: "center" }} className="faint">—</td>;
            const state = !sub ? "none" : (sub.approved ? "ok" : (sub.status === "queued" ? "wait" : (sub.status === "rejected" ? "bad" : "ready")));
            return (<td key={pid} style={{ textAlign: "center" }}>
              <button className="iconbtn" style={{ width: 30, height: 30 }} title={state === "none" ? "not submitted" : (sub.approved ? "approved — click to reopen" : "open submission")}
                onClick={() => sub && setOpen({ uid: u.id, pid })}>
                {state === "ok" ? <CheckCircle2 size={16} className="c-pass" /> : state === "wait" ? <Clock size={15} className="c-gold" /> : state === "bad" ? <X size={15} className="c-fail" /> : state === "ready" ? <Eye size={15} className="c-teal" /> : <Minus size={14} className="faint" />}
              </button></td>); })}
          <td>{allOk ? <span className="badge b-approved">released</span> : <span className="badge b-pending">{ids.filter((p) => ps[p]?.approved).length}/{ids.length} approved</span>}</td>
        </tr>); })}
    </tbody></table></div>
    {open && (() => { const u = db.users.find((x) => x.id === open.uid); const sub = ((db.projectSubs || {})[open.uid] || {})[open.pid]; if (!sub) return null; const rev = sub.review;
      return (<div className="modal-bg" onClick={() => setOpen(null)}><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div><div className="disp head" style={{ fontWeight: 700 }}>{PROJ_TITLES[u.track][open.pid]}</div><div className="faint" style={{ fontSize: 12 }}>{u.name} · submitted {sub.at?.slice(0, 10)}</div></div>
          <button className="iconbtn" onClick={() => setOpen(null)}><X size={15} /></button></div>
        {rev ? (<Card style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
            <span className={`badge ${rev.verdict === "pass" ? "b-approved" : rev.verdict === "reject" ? "b-rejected" : "b-pending"}`}>AI: {rev.verdict}</span>
            <span className="faint" style={{ fontSize: 11 }}>relevant: {String(rev.relevant)} · {rev.authenticity}</span></div>
          <div className="ink" style={{ fontSize: ".85rem" }}>{rev.summary}</div>
          {rev.wrong?.length > 0 && <ul style={{ margin: "8px 0 0 16px", fontSize: ".8rem" }} className="c-fail">{rev.wrong.map((x, i) => <li key={i} className="ink">{x}</li>)}</ul>}
        </Card>) : <div className="note" style={{ marginBottom: 12 }}>AI review still pending (arrives a few hours after submission).</div>}
        <div className="lbl">Submitted code</div><div className="code" style={{ maxHeight: 260, marginBottom: 12 }}>{sub.code}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {sub.approved
            ? <Btn kind="ghost" onClick={() => { setSub(open.uid, open.pid, { approved: false }); flash("Approval removed"); }}>Remove approval</Btn>
            : <Btn onClick={() => { setSub(open.uid, open.pid, { approved: true }); flash("Project approved ✓"); setOpen(null); }}><Check size={15} /> Approve this project</Btn>}
          <Btn kind="ghost" onClick={() => { setSub(open.uid, open.pid, { locked: false, status: "reopened", approved: false }); flash("Sent back — the student can resubmit"); setOpen(null); }}>Send back for rework</Btn>
        </div>
      </div></div>); })()}
  </div>);
}
function ProjectsFeedAdmin({ db, commit, flash }) {
  const items = projList(db); const [open, setOpen] = useState(null);
  const save = (arr) => commit({ ...db, site: { ...db.site, projects: arr } });
  const add = () => { const np = { id: uid(), title: "New experiment", blurb: "", tag: "STM32", cover: "", body: "", media: [], published: false, at: NOW() }; save([np, ...items]); setOpen(np.id); };
  const upd = (id, field, v) => save(items.map((p) => p.id === id ? { ...p, [field]: v } : p));
  const del = (id) => { if (typeof window !== "undefined" && window.confirm && !window.confirm("Delete this experiment?")) return; save(items.filter((p) => p.id !== id)); };
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= items.length) return; const a = items.slice(); const t = a[i]; a[i] = a[j]; a[j] = t; save(a); };
  const subs = db.site.subscribers || [];
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
      <div><div className="disp head" style={{ fontWeight: 700 }}>Projects & experiments feed</div><div className="muted" style={{ fontSize: ".82rem" }}>Publish STM32 builds. Published ones appear on the public site.</div></div>
      <Btn onClick={add}><Plus size={15} /> New experiment</Btn>
    </div>
    {subs.length > 0 && (<Card style={{ padding: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}><span className="muted" style={{ fontSize: ".82rem" }}><Mail size={13} style={{ verticalAlign: "-2px" }} /> {subs.length} newsletter subscriber{subs.length > 1 ? "s" : ""}</span><Btn sm kind="ghost" onClick={() => { try { navigator.clipboard.writeText(subs.map((x) => x.email).join(", ")); flash("Emails copied"); } catch (e) {} }}><Copy size={13} /> Copy emails</Btn></Card>)}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{items.length === 0 ? <div className="faint" style={{ fontSize: 13 }}>No experiments yet - click New experiment.</div> : items.map((p, i) => (<Card key={p.id} style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span className={`badge ${p.published ? "b-approved" : "b-pending"}`}>{p.published ? "Published" : "Draft"}</span>
        <input className="inline-edit" style={{ flex: 1, minWidth: 160, fontWeight: 700 }} value={p.title} onChange={(e) => upd(p.id, "title", e.target.value)} />
        <button className="iconbtn" style={{ width: 26, height: 26, fontSize: 13 }} title="Up" onClick={() => move(i, -1)} disabled={i === 0}>&#8593;</button>
        <button className="iconbtn" style={{ width: 26, height: 26, fontSize: 13 }} title="Down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>&#8595;</button>
        <Btn sm kind="ghost" onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? "Close" : "Edit"}</Btn>
        <button className="iconbtn" style={{ width: 26, height: 26 }} title="Delete" onClick={() => del(p.id)}><Trash2 size={13} /></button>
      </div>
      {open === p.id && (<div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="grid sm:grid-cols-2 gap-3"><Field label="Tag (e.g. Sensors, CAN, Motor)" value={p.tag} onChange={(e) => upd(p.id, "tag", e.target.value)} /><Field label="Cover image URL" value={p.cover} onChange={(e) => upd(p.id, "cover", e.target.value)} placeholder="https://…" /></div>
        <Area label="Short blurb (shown on the card)" rows={2} value={p.blurb} onChange={(e) => upd(p.id, "blurb", e.target.value)} />
        <Area label="Full write-up" rows={7} value={p.body} onChange={(e) => upd(p.id, "body", e.target.value)} placeholder="Describe the experiment, steps, parts, results…" />
        <div><div className="lbl" style={{ marginBottom: 6 }}>Videos, images & PDFs (reorder with the arrows)</div><MediaManager media={p.media || []} flash={flash} onChange={(arr) => upd(p.id, "media", arr)} /></div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", cursor: "pointer" }}><input type="checkbox" checked={!!p.published} onChange={(e) => upd(p.id, "published", e.target.checked)} /> Published (visible on the public site)</label>
      </div>)}
    </Card>))}</div>
  </div>);
}
function SetPassword({ db, commit, session, setSession, setView, flash }) {
  const me = db.users.find((u) => u.id === session.id) || session;
  const [p1, setP1] = useState(""); const [p2, setP2] = useState("");
  const save = () => {
    if (p1.length < 6) return flash("Use at least 6 characters");
    if (p1 !== p2) return flash("Passwords do not match");
    const upd = { ...me, password: p1, mustSetPassword: false };
    commit({ ...db, users: db.users.map((u) => u.id === me.id ? upd : u) });
    setSession(upd); setView("student"); flash("Password set - you're all set!");
  };
  return (<div className="max-w-md mx-auto px-5" style={{ paddingTop: 80, paddingBottom: 80 }}><Card style={{ padding: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><KeyRound size={22} className="c-green" /><div className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Set your password</div></div>
    <p className="muted" style={{ fontSize: ".85rem", marginBottom: 18 }}>Welcome, {(me.name || "there").split(" ")[0]}! Choose a password you will use to sign in from now on.</p>
    <Field label="New password" icon={Lock} type="password" value={p1} onChange={(e) => setP1(e.target.value)} placeholder="At least 6 characters" />
    <Field label="Confirm password" icon={Lock} type="password" value={p2} onChange={(e) => setP2(e.target.value)} />
    <div style={{ marginTop: 8 }}><Btn onClick={save}><Save size={15} /> Save &amp; continue</Btn></div>
  </Card></div>);
}
const PROJ_TITLES = {
  btech: { p1: "Loopback — Hello CAN", p2: "Temperature Telemetry Node", p3: "Two-Node Command & Telemetry", p4: "Full Smart Sensor Node (capstone)" },
  mtech: { p1: "Sensored → Sensorless Handover", p2: "Fault Injection & Safe Shutdown", p3: "EV Traction Emulator (capstone)" },
};
const PROJ_BRIEF = {
  btech: { p1: "Transmit a counter every second in CAN loopback mode and print sent vs received; they must match.",
           p2: "Read a temperature sensor over I2C, calibrate to Celsius, pack with scale 0.1 offset -40, broadcast on 0x100 at 10 Hz.",
           p3: "Node A streams telemetry on 0x100; Node B sends a set-rate command on 0x200; A filters for 0x200 and changes its rate.",
           p4: "RTOS sensor task (100 Hz) -> queue -> CAN task (10 Hz) packing a dynamics frame, an RX command task, and a fault state machine driving RUN/DEGRADED/SAFE plus a watchdog." },
  mtech: { p1: "Start the motor on Hall sensors, run the PLL observer in parallel, hand the angle over above a speed/error threshold, then run sensorless.",
           p2: "Arming gate (bus voltage, current offset, over-current), phase-loss detection, stall detection with a time filter, latched over-current, and clean recovery.",
           p3: "Throttle to torque command with limits, a vehicle model (mass, rolling resistance, drag), speed and current loops, and regen braking with negative iq." },
};
function studentLastActivity(db, u) {
  let last = null;
  const bump = (t) => { if (t && (!last || t > last)) last = t; };
  Object.keys(db.submissions || {}).forEach((k) => { if (k.startsWith(u.id + ":")) bump(db.submissions[k]?.at); });
  const ps = (db.projectSubs || {})[u.id] || {};
  Object.values(ps).forEach((s) => bump(s?.at));
  Object.values(db.tickets || {}).forEach((list) => (list || []).forEach((t) => { if ((t.email || "").toLowerCase() === (u.email || "").toLowerCase()) bump(t.ts); }));
  return last || u.startDate || null;
}
function daysBetween(a, b) { if (!a || !b) return 0; return Math.floor((new Date(b) - new Date(a)) / 86400000); }
function computeRiskList(db) {
  const students = db.users.filter((u) => u.role === "student" && u.access && u.track);
  const now = NOW();
  const out = [];
  students.forEach((u) => {
    const track = u.track; const mods = db.questions[track] || [];
    if (!mods.length) return;
    const passedCount = mods.filter((m) => cDone(db, u, m.id)).length;
    const totalDays = u.durationDays || 180;
    const elapsed = Math.max(1, daysBetween(u.startDate, now));
    const expectedPassed = Math.min(mods.length, Math.floor((elapsed / totalDays) * mods.length));
    const lastAct = studentLastActivity(db, u);
    const daysQuiet = daysBetween(lastAct, now);
    const modulesBehind = expectedPassed - passedCount;
    const ps = (db.projectSubs || {})[u.id] || {};
    const stuckProject = Object.entries(ps).find(([, s]) => s && s.status === "reopened" && daysBetween(s.at, now) >= 4);
    if (daysQuiet >= 4 && modulesBehind >= 2) {
      out.push({ u, reason: "quiet", daysQuiet, modulesBehind, passedCount, totalMods: mods.length, currentModule: (mods[passedCount] || mods[mods.length - 1])?.title || `Module ${passedCount + 1}` });
    } else if (stuckProject) {
      out.push({ u, reason: "stuck_project", daysQuiet, projId: stuckProject[0], daysSinceReopen: daysBetween(stuckProject[1].at, now), passedCount, totalMods: mods.length });
    }
  });
  return out;
}
async function aiDraftCheckin(risk) {
  const { u, reason } = risk;
  const track = u.track === "mtech" ? "M.Tech Sensorless FOC" : "B.Tech Smart Sensor Node";
  const context = reason === "quiet"
    ? `${u.name} has been quiet for ${risk.daysQuiet} days and is ${risk.modulesBehind} module(s) behind the expected pace (${risk.passedCount}/${risk.totalMods} modules passed). Their current module is likely: ${risk.currentModule}.`
    : `${u.name} had a project sent back for rework ${risk.daysSinceReopen} days ago and has not resubmitted since.`;
  const sys = `You are Mabi, the founder and mentor of CAEE (Centre for Automotive Embedded Engineering), a ${track} internship. Write a short, warm, specific check-in message to a student who may be stuck.

RULES:
- 2-4 sentences, plain and human, like a text message from a mentor who actually looked at their progress - not a system notification.
- NEVER say "you're behind", "you're late", or anything that sounds like a warning. Normalize being stuck - most students hit exactly this point.
- Reference the SPECIFIC situation given below, not a generic template.
- End with a low-pressure, easy-to-accept offer (a short call, a hint, or just "reply here whenever").
- No corporate language, no exclamation-mark enthusiasm, no emojis.
- Output ONLY the message text, nothing else.

SITUATION: ${context}`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: aiHdrs(), body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, system: sys, messages: [{ role: "user", content: "Draft the check-in message." }] }) });
    const data = await r.json();
    const txt = (data.content || []).filter((i) => i.type === "text").map((i) => i.text).join("\n").trim();
    return txt || null;
  } catch (e) { return null; }
}

async function aiProjectReview(track, projId, code) {
  const title = (PROJ_TITLES[track] || {})[projId] || projId;
  const brief = (PROJ_BRIEF[track] || {})[projId] || "";
  const sys = `You are a senior embedded engineer reviewing a student's CAEE internship project.

PROJECT: ${title}
WHAT IT MUST DO: ${brief}

Judge ONLY the submitted C code. Reply as strict JSON, no markdown:
{"relevant":true|false,"verdict":"pass"|"revise"|"reject","summary":"2-3 sentences","right":["..."],"wrong":["..."],"next":["..."],"authenticity":"looks student-written"|"possibly generated"|"unclear"}

Rules:
- relevant=false and verdict="reject" if the code is for a different task, is empty, is placeholder/nonsense, or just prints the expected words without implementing anything.
- verdict="pass" only if it genuinely implements the project.
- "wrong" must explain WHY something is wrong. NEVER write corrected code or give the solution.
- authenticity: note generic naming, no project-specific detail, or textbook-perfect code with no rough edges - but say "unclear" rather than accusing.`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: aiHdrs(), body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: sys, messages: [{ role: "user", content: (code || "").slice(0, 24000) }] }) });
    const data = await r.json();
    const txt = (data.content || []).filter((i) => i.type === "text").map((i) => i.text).join("\n").replace(/```json|```/g, "").trim();
    return JSON.parse(txt);
  } catch (e) { return null; }
}
async function aiMentorAnswer(question, moduleLabel, trackName) {
  // Routed through the server-side caee-api Edge Function so the Anthropic
  // key never reaches the browser (same reasoning as the login rework).
  try {
    if (!window.__caeeAI) return null;
    const txt = await window.__caeeAI.answer(question, moduleLabel, trackName);
    return txt || null;
  } catch (e) { return null; }
}
function TicketBoard({ db, commit, board, who, flash, trackName }) {
  const MAXLEN = 2600; // roughly 400 words
  const all = (db.tickets && db.tickets[board]) || [];
  const mine = who && who.email ? all.filter((t) => (t.email || "").toLowerCase() === who.email.toLowerCase()) : [];
  const [text, setText] = useState("");
  const canPost = !!(who && who.email);
  const saveList = (next) => commit({ ...db, tickets: { ...(db.tickets || {}), [board]: next } });
  const submit = () => {
    const t = text.trim();
    if (!t) return flash && flash("Write your doubt first");
    if (t.length > MAXLEN) return flash && flash("Please keep it under about 400 words");
    if (!canPost) return flash && flash("Please register or sign in first");
    const ticket = { id: uid(), name: (who.name || "Student").slice(0, 60), email: (who.email || "").toLowerCase(), text: t, ts: NOW(), replies: [] };
    const next = [...all, ticket];
    saveList(next);
    setText("");
    flash && flash("Doubt submitted");
    if (db.site.mentorAI) {
      (async () => {
        const ans = await aiMentorAnswer(t, "General", trackName || "");
        if (!ans) return;
        const reply = { id: uid(), text: ans, ts: NOW(), from: "ai", name: "CAEE Mentor" };
        commit({ ...db, tickets: { ...(db.tickets || {}), [board]: next.map((x) => (x.id === ticket.id ? { ...x, replies: [...x.replies, reply] } : x)) } });
      })();
    }
  };
  const when = (ts) => { try { return new Date(ts).toLocaleString(); } catch (e) { return ""; } };
  return (<Card style={{ padding: 20 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><MessageSquare size={18} className="c-teal" /><h3 className="disp head" style={{ fontSize: "1.05rem", fontWeight: 700 }}>Raise a ticket</h3></div>
    <p className="muted" style={{ fontSize: ".84rem", marginBottom: 14 }}>Ask your mentor a doubt privately — only you and the CAEE team see this, not other students.</p>
    {canPost ? (<div style={{ marginBottom: 20 }}>
      <textarea className="input" rows={5} maxLength={MAXLEN} value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe your doubt in detail (up to about 400 words)..." />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}><span className="faint" style={{ fontSize: 11 }}>{text.length}/{MAXLEN}</span><Btn sm onClick={submit}><MessageSquare size={13} /> Submit ticket</Btn></div>
    </div>) : (<div className="note" style={{ marginBottom: 14 }}>Sign in or register to raise a ticket.</div>)}
    <div className="lbl" style={{ marginBottom: 10 }}>Your tickets</div>
    {mine.length === 0 ? (<div className="faint" style={{ fontSize: 13, textAlign: "center", padding: "18px 0" }}>No tickets yet.</div>) :
      (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{mine.slice().sort((a, b) => (a.ts < b.ts ? 1 : -1)).map((t) => (<div key={t.id} className="tint" style={{ padding: 12, borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span className="faint" style={{ fontSize: 11 }}>{when(t.ts)}</span></div>
        <div className="ink" style={{ fontSize: ".86rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{t.text}</div>
        {t.replies.length > 0 ? t.replies.map((r) => (<div key={r.id} style={{ borderLeft: "2px solid var(--green)", paddingLeft: 10, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span className="ink" style={{ fontWeight: 600, fontSize: ".8rem" }}>{r.name}</span>{r.from === "ai" && <span className="pill pill-green" style={{ fontSize: 10 }}>MENTOR</span>}<span className="faint" style={{ fontSize: 11 }}>{when(r.ts)}</span></div>
          <div className="ink" style={{ fontSize: ".82rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{r.text}</div>
        </div>)) : (<div className="faint" style={{ marginTop: 6, fontSize: 12 }}>Waiting for a reply…</div>)}
      </div>))}</div>)}
  </Card>);
}

function TicketAdmin({ db, commit, flash }) {
  const boards = [["t:btech", "B.Tech internship"], ["t:mtech", "M.Tech internship"], ["ws:btech", "B.Tech workshop"], ["ws:mtech", "M.Tech workshop"]];
  const [b, setB] = useState("t:btech");
  const count = (id) => ((db.tickets && db.tickets[id]) || []).length;
  const open = (id) => ((db.tickets && db.tickets[id]) || []).filter((t) => t.replies.length === 0).length;
  const all = (db.tickets && db.tickets[b]) || [];
  const [replyText, setReplyText] = useState({});
  const saveList = (next) => commit({ ...db, tickets: { ...(db.tickets || {}), [b]: next } });
  const reply = (t) => {
    const txt = (replyText[t.id] || "").trim();
    if (!txt) return flash && flash("Write a reply first");
    const r = { id: uid(), text: txt, ts: NOW(), from: "admin", name: "CAEE Mentor" };
    saveList(all.map((x) => (x.id === t.id ? { ...x, replies: [...x.replies, r] } : x)));
    setReplyText({ ...replyText, [t.id]: "" });
    flash && flash("Reply sent");
  };
  const when = (ts) => { try { return new Date(ts).toLocaleString(); } catch (e) { return ""; } };
  return (<div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
      <div className="muted" style={{ fontSize: ".85rem" }}>Student doubts, private per student — nobody else sees another student's ticket.</div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", cursor: "pointer" }}>
        <input type="checkbox" checked={!!db.site.mentorAI} onChange={(e) => commit({ ...db, site: { ...db.site, mentorAI: e.target.checked } })} />
        AI auto-answers new tickets
      </label>
    </div>
    <div className="tabbar" style={{ marginBottom: 16 }}>{boards.map(([id, lbl]) => <button key={id} className={`tab ${b === id ? "active" : ""}`} onClick={() => setB(id)}>{lbl} <span className="faint">({count(id)}{open(id) > 0 ? `, ${open(id)} open` : ""})</span></button>)}</div>
    {all.length === 0 ? (<div className="faint" style={{ fontSize: 13, textAlign: "center", padding: "24px 0" }}>No tickets on this board yet.</div>) :
      (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{all.slice().sort((a, b2) => (a.ts < b2.ts ? 1 : -1)).map((t) => (<Card key={t.id} style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}><span className="ink" style={{ fontWeight: 600, fontSize: ".84rem" }}>{t.name}</span><span className="faint" style={{ fontSize: 11 }}>{t.email}</span><span className="faint" style={{ fontSize: 11 }}>{when(t.ts)}</span>{t.replies.length === 0 && <span className="pill" style={{ fontSize: 10, background: "rgba(232,184,75,.18)", color: "#8a6a14" }}>OPEN</span>}</div>
        <div className="ink" style={{ fontSize: ".86rem", lineHeight: 1.55, whiteSpace: "pre-wrap", marginBottom: 8 }}>{t.text}</div>
        {t.replies.map((r) => (<div key={r.id} style={{ borderLeft: "2px solid var(--green)", paddingLeft: 10, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span className="ink" style={{ fontWeight: 600, fontSize: ".8rem" }}>{r.name}</span>{r.from === "ai" && <span className="pill pill-green" style={{ fontSize: 10 }}>MENTOR</span>}<span className="faint" style={{ fontSize: 11 }}>{when(r.ts)}</span></div>
          <div className="ink" style={{ fontSize: ".82rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{r.text}</div>
        </div>))}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <input className="input" style={{ flex: 1 }} value={replyText[t.id] || ""} onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })} placeholder="Write a reply..." onKeyDown={(e) => { if (e.key === "Enter") reply(t); }} />
          <Btn sm onClick={() => reply(t)}>Reply</Btn>
        </div>
      </Card>))}</div>)}
  </div>);
}

function Ring({ pct, size = 64, label }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (<div style={{ position: "relative", width: size, height: size }}>
    <svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth="7" fill="none" /><circle cx={size / 2} cy={size / 2} r={r} stroke="var(--green)" strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .6s" }} /></svg>
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span className="disp head" style={{ fontWeight: 800, fontSize: size / 4.2 }}>{Math.round(pct)}%</span>{label && <span className="faint" style={{ fontSize: 9 }}>{label}</span>}</div>
  </div>);
}
function useStreak(uid) {
  const [streak, setStreak] = useState(0);
  useEffect(() => { (async () => { try {
    const key = "caee:streak:" + uid; const today = new Date().toISOString().slice(0, 10);
    let d = { last: "", count: 0 }; try { const r = await window.storage.get(key, false); d = JSON.parse(r.value); } catch (e) {}
    if (d.last !== today) { const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10); d = { last: today, count: d.last === y ? (d.count || 0) + 1 : 1 }; await window.storage.set(key, JSON.stringify(d), false); }
    setStreak(d.count || 1);
  } catch (e) {} })(); }, [uid]);
  return streak;
}
function StreakChip({ n }) { if (!n) return null; return (<span className="pill" style={{ background: "rgba(238,107,45,.12)", color: "#b34d16", fontWeight: 700 }}>🔥 {n}-day streak</span>); }
function Badges({ items }) { const done = items.filter((x) => x.done); if (done.length === 0) return null;
  return (<div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}><Award size={14} className="c-gold" />{done.map((x) => <span key={x.label} className="pill pill-green" title="Completed">{x.label} ✓</span>)}</div>); }
function StudentPortal({ db, commit, session, flash, setView }) {
  const me = db.users.find((u) => u.id === session.id) || session;
  if (!me.access || !me.track) return <AccessPending />;
  const [hidden, setHidden] = useState(false);
  useProtect(true);
  useEffect(() => { const onVis = () => setHidden(document.hidden); document.addEventListener("visibilitychange", onVis); return () => { document.removeEventListener("visibilitychange", onVis); }; }, []);
  const track = me.track || "btech"; const mods = db.questions[track]; const projs = db.projects[track]; const T = TRACK[track]; const intro = db.site.trackIntro?.[track] || {};
  const [open, setOpen] = useState(null); const [form, setForm] = useState({ code: "", out: "", note: "" });
  const [running, setRunning] = useState(false); const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false); const [scan, setScan] = useState(null); const [editing, setEditing] = useState(false);
  const [issueText, setIssueText] = useState(""); const [issueSent, setIssueSent] = useState(false); const [tab, setTab] = useState("work");
  const labProg = ((db.labProgress || {})[me.id] || {})[track] || {};
  const [seenTs, setSeenTs] = useState(null);
  useEffect(() => { (async () => { try { const r = await window.storage.get("caee:seen:t:" + track + ":" + me.id, false); setSeenTs(r.value || ""); } catch (e) { setSeenTs(""); } })(); }, [track, me.id]);
  const unread = seenTs === null ? 0 : ((db.discussions || {})["t:" + track] || []).filter((c) => c.ts > seenTs && (c.ai || c.staff) && (!c.email || c.email !== (me.email || "").toLowerCase())).length;
  const markSeen = () => { const now = NOW(); setSeenTs(now); try { window.storage.set("caee:seen:t:" + track + ":" + me.id, now, false); } catch (e) {} };
  useEffect(() => { const hp = (ev) => { const d = ev.data && ev.data.caeeProject; if (!d || !d.project || !d.code) return;
    const lab = d.lab === "mtech" ? "mtech" : "btech"; if (lab !== track) return;
    const all = db.projectSubs || {}; const mine = all[me.id] || {}; const cur2 = mine[d.project];
    if (cur2 && cur2.locked) return;
    const wait = (4 + Math.random() * 2) * 3600000;   // review lands in 4-6 hours
    commit({ ...db, projectSubs: { ...all, [me.id]: { ...mine, [d.project]: {
      track: lab, code: String(d.code).slice(0, 60000), at: NOW(), locked: true,
      status: "queued", reviewDueAt: Date.now() + wait, review: null, approved: false } } } });
    flash("Project submitted — your mentor's review will arrive in a few hours");
  }; window.addEventListener("message", hp); return () => window.removeEventListener("message", hp); });
  const projRan = useRef(false);
  useEffect(() => { if (projRan.current) return; projRan.current = true; (async () => {
    const all = { ...(db.projectSubs || {}) }; const mine = { ...(all[me.id] || {}) }; let changed = false;
    for (const k of Object.keys(mine)) { const sub = mine[k];
      if (sub && sub.status === "queued" && sub.reviewDueAt && Date.now() >= sub.reviewDueAt && !sub.review) {
        const rev = await aiProjectReview(sub.track || track, k, sub.code);
        if (rev) { mine[k] = { ...sub, review: rev, status: rev.verdict === "reject" ? "rejected" : "reviewed" }; changed = true; }
      } }
    if (changed) commit({ ...db, projectSubs: { ...all, [me.id]: mine } });
  })(); });
  useEffect(() => { const labs = db.site.labs || {}; const base = (labs[track] || "").trim() || `/labs/${track}_lab.html`; let labOrigin = window.location.origin; try { labOrigin = new URL(base, window.location.href).origin; } catch (e) {}
    const fwBase = (labs.compile || "").trim().replace(/\/+$/, "").replace(/\/(run|api\/labs\/[A-Za-z-]+)$/, "");
    const record = (mod) => { const mine = (db.labProgress || {})[me.id] || {}; const t = mine[track] || {}; if (t[mod]) return; commit({ ...db, labProgress: { ...(db.labProgress || {}), [me.id]: { ...mine, [track]: { ...t, [mod]: true, at: NOW() } } } }); };
    const h = async (ev) => { if (ev.origin !== labOrigin) return;
      if (ev.data && ev.data.caeeLabHello) { let tok = window.__caeeLabToken; if (!tok) { try { tok = sessionStorage.getItem("caee:labToken"); } catch (e) {} } if (tok && ev.source) ev.source.postMessage({ caeeLabAuth: { token: tok, user: me.name } }, ev.origin); return; }
      const d = ev.data && ev.data.caeeLab; if (!d || !d.pass || !d.module) return; const lab = d.lab === "mtech" ? "mtech" : "btech"; if (lab !== track) return;
      if (/^C[1-3]$/.test(d.module)) { record(d.module); return; } // common C modules keep the existing flow
      if (typeof d.completionId !== "string" || !fwBase) return; // firmware modules: only a server-verified completion counts
      try { const r = await fetch(fwBase + "/api/fw/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completionId: d.completionId }) }); const j = await r.json();
        if (j && j.valid && j.record && j.record.moduleId === d.module && j.record.sub === me.id && j.record.track === track) record(d.module); } catch (e) {} };
    window.addEventListener("message", h); return () => window.removeEventListener("message", h); });
  const labRequired = !!(db.site.labs && db.site.labs.required);
  const labModCount = LAB_MODULE_COUNT[track] || 6;
  const labModsDone = (LAB_IDS[track] || []).filter((k) => !!labProg[k]).length;
  const labOk = !labRequired || labModsDone >= labModCount;
  const sub = (t, id) => db.submissions[subKey(me.id, t, id)];
  const stat = (t, id) => t === "c" ? (cDone(db, me, id) ? "Passed" : "Not started") : (sub(t, id)?.status || "Not started");
  if (!me.access) return (<div className="max-w-lg mx-auto px-5" style={{ paddingTop: 80 }}><Card style={{ padding: 36, textAlign: "center" }}><Lock size={34} className="c-gold" style={{ margin: "0 auto 14px" }} /><h2 className="disp head" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>Course access pending</h2><p className="muted" style={{ fontSize: ".9rem", lineHeight: 1.6 }}>Your account is active, but your course material hasn't been unlocked yet. Once your payment and enrolment are confirmed, your mentor will grant access and your modules will appear here.</p></Card></div>);
  const total = mods.slice(1).length + projs.length; // Module 0 (intro videos) is informational, excluded from the completion count
  const passed = mods.slice(1).filter((m) => stat("c", m.id) === "Passed").length + projs.filter((p) => stat("p", p.id) === "Passed").length;
  const dl = daysLeft(me); const complete = allPassed(db, me);
  const unlocked = (i) => i <= 1 || stat("c", mods[i - 1].id) === "Passed"; // i<=1: Module 0 (intro videos, no challenge) and the first real module are always open
  const modulesDone = mods.length > 1 && mods.slice(1).every((m) => stat("c", m.id) === "Passed"); // slice(1): Module 0 (intro videos) is informational, not gated
  const openC = (m) => { setOpen({ type: "c", item: m }); };
  const openHW = (m) => { const x = sub("hw", m.id); setForm({ code: x?.note || "", out: "", note: x?.video || "" }); setScan(x?.security || null); setScanning(false); setOpen({ type: "hw", item: m }); };
  const openP = (p) => { const x = sub("p", p.id); setForm({ code: "", out: "", note: x?.note || "" }); setOpen({ type: "p", item: p }); };
  const close = () => { setOpen(null); setForm({ code: "", out: "", note: "" }); setResult(null); setRunning(false); setScan(null); setScanning(false); setEditing(false); setIssueText(""); setIssueSent(false); };
  const submitIssue = () => { if (!issueText.trim()) return flash("Describe the issue first"); const it = { id: uid(), userId: me.id, name: me.name, email: me.email, track, moduleId: open.item.id, moduleTitle: open.item.title, type: open.type, text: issueText.trim().slice(0, 4000), at: NOW(), status: "open", reply: "" }; commit({ ...db, issues: [it, ...(db.issues || [])] }); setIssueText(""); setIssueSent(true); flash("Issue reported — your mentor will see it"); };
  const submitC = async () => {
    if (!form.code.trim()) return flash("Write your C code first");
    const status = "Passed"; setEditing(false);
    const k = subKey(me.id, "c", open.item.id);
    commit({ ...db, submissions: { ...db.submissions, [k]: { ...(db.submissions[k] || {}), status, note: form.code, output: "", compileErrors: "", at: TODAY(), reviewStatus: "queued", reviewDueAt: reviewDue(), review: "" } } });
    flash("\u2713 Code submitted \u2014 module complete. Your mentor will review it.");
  };
  const submitHW = async () => {
    if (!form.code.trim()) return flash("Paste your hardware C code first");
    setScanning(true); setScan(null);
    const sec = await securityScan(form.code, db.site.security?.rules || []);
    setScanning(false); setScan(sec);
    const k = subKey(me.id, "hw", open.item.id);
    commit({ ...db, submissions: { ...db.submissions, [k]: { ...(db.submissions[k] || {}), status: "Submitted", note: form.code, security: sec, at: TODAY(), reviewStatus: "queued", reviewDueAt: reviewDue(), review: "" } } });
    flash(sec.clean ? "✓ Submitted — passed the security scan" : "Submitted — flagged by security scan, held for review");
  };
  const submitP = () => { if (!form.note.trim()) return flash("Nothing to submit"); const k = subKey(me.id, "p", open.item.id); commit({ ...db, submissions: { ...db.submissions, [k]: { ...(db.submissions[k] || {}), status: "Submitted", note: form.note, at: TODAY(), reviewStatus: "queued", reviewDueAt: reviewDue(), review: "" } } }); close(); flash("Submitted — project lead review arrives in ~6–8h"); };
  return (<div className="noselect"><Watermark text={me.email} />{hidden && <div className="blurcover"><ShieldAlert size={34} className="c-gold" /><div className="disp head" style={{ fontWeight: 700 }}>Content hidden</div><div className="muted" style={{ fontSize: ".85rem" }}>Course material is hidden while this window is inactive.</div></div>}
    <div className="max-w-5xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div style={{ marginBottom: 16 }}><BackLink onClick={() => setView("student")} /></div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24 }}><div><div className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>{TRACK[track].tag} track</div><h1 className="disp head" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Programming &amp; Projects</h1></div><div style={{ display: "flex", gap: 12 }}><Stat label="Completed" value={`${passed}/${total}`} /><Stat label="Days left" value={dl == null ? "—" : dl < 0 ? "ended" : dl} accent={dl != null && dl <= 7} /></div></div>
      <div className="track-bg" style={{ marginBottom: 24 }}><div className="track-fill" style={{ width: `${(passed / total) * 100}%` }} /></div>
      <div className="tabbar" style={{ marginBottom: 20 }}><button className={`tab ${tab === "work" ? "active" : ""}`} onClick={() => setTab("work")}><FolderKanban size={14} /> Modules &amp; Projects</button><button className={`tab ${tab === "discuss" ? "active" : ""}`} style={{ position: "relative" }} onClick={() => { setTab("discuss"); setOpen(null); markSeen(); }}><MessageSquare size={14} /> Doubts{unread > 0 && <span className="reddot" title={`${unread} new repl${unread > 1 ? "ies" : "y"}`} />}</button><button className={`tab ${tab === "lab" ? "active" : ""}`} onClick={() => { setTab("lab"); setOpen(null); }}><Cpu size={14} /> Virtual Lab</button></div>
      {tab === "work" && (() => { const ps = (db.projectSubs || {})[me.id] || {}; const ids = Object.keys(PROJ_TITLES[track] || {});
        if (!ids.length) return null;
        return (<Card style={{ padding: 18, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><FolderKanban size={16} className="c-teal" /><h3 className="disp head" style={{ fontSize: "1rem", fontWeight: 700 }}>Projects &amp; mentor review</h3></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{ids.map((pid) => { const sub = ps[pid]; const rev = sub && sub.review;
            const st = !sub ? "not submitted" : (sub.approved ? "approved" : (sub.status === "queued" ? "in review" : (sub.status === "rejected" ? "needs rework" : "reviewed")));
            const col = sub && sub.approved ? "b-approved" : (st === "needs rework" ? "b-rejected" : "b-pending");
            return (<div key={pid} className="tint" style={{ padding: 12, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {sub && sub.approved ? <CheckCircle2 size={15} className="c-pass" /> : <span style={{ width: 15 }} />}
                <span className="ink" style={{ fontWeight: 600, fontSize: ".85rem" }}>{PROJ_TITLES[track][pid]}</span>
                <span className={`badge ${col}`}>{st}</span>
                {sub && sub.status === "queued" && <span className="faint" style={{ fontSize: 11 }}>submitted {sub.at?.slice(0, 10)} — your mentor reviews within a few hours</span>}
              </div>
              {rev && (<div style={{ marginTop: 8, borderLeft: "2px solid var(--green)", paddingLeft: 10 }}>
                <div className="c-green" style={{ fontSize: 11, fontWeight: 700 }}>MENTOR REVIEW</div>
                <div className="ink" style={{ fontSize: ".82rem", marginTop: 2 }}>{rev.summary}</div>
                {rev.right?.length > 0 && (<div style={{ marginTop: 6 }}><span className="c-pass" style={{ fontSize: 11, fontWeight: 700 }}>WHAT'S RIGHT</span><ul style={{ margin: "3px 0 0 16px", fontSize: ".8rem" }}>{rev.right.map((x, i) => <li key={i}>{x}</li>)}</ul></div>)}
                {rev.wrong?.length > 0 && (<div style={{ marginTop: 6 }}><span className="c-fail" style={{ fontSize: 11, fontWeight: 700 }}>WHAT NEEDS WORK</span><ul style={{ margin: "3px 0 0 16px", fontSize: ".8rem" }}>{rev.wrong.map((x, i) => <li key={i}>{x}</li>)}</ul></div>)}
                {rev.next?.length > 0 && (<div style={{ marginTop: 6 }}><span className="c-gold" style={{ fontSize: 11, fontWeight: 700 }}>NEXT STEPS</span><ul style={{ margin: "3px 0 0 16px", fontSize: ".8rem" }}>{rev.next.map((x, i) => <li key={i}>{x}</li>)}</ul></div>)}
              </div>)}
            </div>); })}</div>
          <div className="note" style={{ marginTop: 12, fontSize: 11 }}>Every project must be approved by your mentor before your certificate is issued.</div>
        </Card>); })()}
      {tab === "lab" && (() => { const labs = db.site.labs || {}; const base = (labs[track] || "").trim() || `/labs/${track}_lab.html`; const params = [];
        if (labs.compile) params.push("compile=" + encodeURIComponent(labs.compile.trim()));
        params.push("origin=" + encodeURIComponent(window.location.origin));
        const url = base + (base.indexOf("?") >= 0 ? "&" : "?") + params.join("&"); return (<div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div><div className="disp head" style={{ fontWeight: 700, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}><Cpu size={18} className="c-teal" /> {T.name} Virtual Lab</div><div className="muted" style={{ fontSize: ".82rem" }}>Live {track === "mtech" ? "sensorless FOC motor" : "smart sensor node / CAN"} lab — animations, a code editor and PASS/FAIL checks for every module.</div></div>
          <Btn sm kind="ghost" onClick={() => window.open(url, "_blank")}><Play size={13} /> Open full-screen</Btn>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}><span className="lbl" style={{ marginBottom: 0 }}>Lab progress:</span>{(LAB_IDS[track] || []).map((k) => <span key={k} className={`pill ${labProg[k] ? "pill-green" : ""}`} style={labProg[k] ? {} : { background: "#eef2f1", color: "var(--muted)" }}>{k}{labProg[k] ? " ✓" : ""}</span>)}<span className="faint" style={{ fontSize: 11 }}>Passing a module’s Check inside the lab records it here automatically.</span></div>
        <iframe
          src={url}
          onLoad={(e) => {
            const el = e.target;
            try { const tok = window.__caeeLabToken || sessionStorage.getItem("caee:labToken"); if (tok) el.contentWindow.postMessage({ caeeLabAuth: { token: tok, user: me.name } }, new URL(url, window.location.href).origin); } catch (x) {}
            let lastH = 700;
            try {
              const doc = el.contentWindow.document;
              const fit = () => {
                const raw = doc.documentElement.scrollHeight || doc.body.scrollHeight;
                if (!raw) return;
                const capped = Math.min(raw, 6000); // hard ceiling: no legitimate lab view needs more than this
                if (lastH > 900 && capped > lastH * 1.5) { clearInterval(el._caeeFit); return; } // runaway-growth guard: a resize-feedback loop (iframe height -> inner viewport -> inner height) shows up as a sudden large jump; stop auto-fitting rather than spiral
                lastH = capped;
                el.style.height = Math.max(700, capped + 24) + "px";
              };
              fit();
              clearInterval(el._caeeFit);
              el._caeeFit = setInterval(fit, 800); // the lab's own height changes as students switch modules / open Add-ons
            } catch (err) { el.style.height = "1700px"; } // cross-origin fallback: keep the old generous fixed height
          }}
          style={{ width: "100%", height: 700, border: 0, borderRadius: 12, background: "#0e1f1d" }}
          title={`CAEE ${T.name} Virtual Lab`}
        />
      </div>); })()}
      {tab === "discuss" && (<>
        {(() => { const mineIssues = (db.issues || []).filter((i) => i.userId === me.id || (i.email && me.email && i.email.toLowerCase() === me.email.toLowerCase())); return mineIssues.length > 0 ? (<Card style={{ padding: 18, marginBottom: 16 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><MessageSquare size={16} className="c-gold" /><h3 className="disp head" style={{ fontSize: "1rem", fontWeight: 700 }}>My reported issues</h3></div><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{mineIssues.map((i) => { const resolved = i.status === "resolved" || i.status === "closed"; return (<div key={i.id} className="tint" style={{ padding: 12, borderRadius: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><span className="ink" style={{ fontWeight: 600, fontSize: ".82rem" }}>{i.moduleTitle || "General"}</span><span className={`badge ${resolved ? "b-approved" : "b-pending"}`}>{resolved ? "Resolved" : "Open"}</span><span className="faint" style={{ fontSize: 11 }}>{i.at}</span></div><div className="ink" style={{ fontSize: ".82rem", marginTop: 6, whiteSpace: "pre-wrap" }}>{i.text}</div>{i.reply ? (<div style={{ marginTop: 8, borderLeft: "2px solid var(--green)", paddingLeft: 10 }}><div className="c-green" style={{ fontSize: 11, fontWeight: 700 }}>Mentor reply</div><div className="ink" style={{ fontSize: ".82rem", whiteSpace: "pre-wrap" }}>{i.reply}</div></div>) : (<div className="faint" style={{ fontSize: 11, marginTop: 6 }}>Awaiting mentor reply…</div>)}</div>); })}</div></Card>) : null; })()}
        <TicketBoard db={db} commit={commit} board={`t:${track}`} who={{ name: me.name, email: me.email }} flash={flash} trackName={T.name} />
      </>)}
      {tab === "work" && (<>
      {!open && (intro.video || intro.image || intro.desc) && (<Card style={{ padding: 18, marginBottom: 24 }}><div className="grid md:grid-cols-2 gap-5" style={{ alignItems: "center" }}><div>{intro.video ? <VideoEmbed url={intro.video} height={220} /> : intro.image ? <img src={intro.image} alt="intro" style={{ width: "100%", borderRadius: 14, border: "1px solid var(--border)" }} /> : null}</div><div><div className="eyebrow" style={{ fontSize: 11, marginBottom: 6 }}>Start here</div><p className="ink" style={{ fontSize: ".92rem", lineHeight: 1.6 }}>{intro.desc}</p></div></div></Card>)}
      {complete && (<Card style={{ padding: 20, marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--passbg)", borderColor: "rgba(31,157,87,.35)" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><Award size={26} className="c-pass" /><div><div className="disp head" style={{ fontWeight: 600 }}>All modules complete</div><div className="muted" style={{ fontSize: 12 }}>Your completion certificate is ready.</div></div></div><Btn kind="good" onClick={() => setView("results")}><Award size={15} /> View certificate</Btn></Card>)}
      {open ? (() => { const s = sub(open.type, open.item.id); const st = stat(open.type, open.item.id); return (<Card style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}><BackLink onClick={close} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>{open.type === "p" ? <FolderKanban size={18} className="c-green" /> : open.type === "hw" ? <Cpu size={18} className="c-teal" /> : <FileCode size={18} className="c-green" />}<h3 className="disp head" style={{ fontSize: "1.1rem", fontWeight: 600 }}>{open.item.title}</h3><span className="pill" style={{ background: open.type === "hw" ? "rgba(31,139,139,.14)" : "rgba(43,166,101,.12)", color: open.type === "hw" ? "var(--teal)" : "var(--green-d)" }}>{open.type === "c" ? "C code · required" : open.type === "hw" ? "Hardware · optional" : "Project"}</span><Badge status={st} /></div>
        {(open.type === "c" || open.type === "hw") && <ModuleMedia item={open.item} moduleId={open.item.id} db={db} commit={commit} me={me} legacyPdfKey={`caee:modpdf:${open.item.id}`} flash={flash} height={320} emptyLabel="Videos for this module haven't been added yet — check back soon." />}
        {open.type === "c" ? (<>
  {(() => { const vidOk = videoWatched(db, me, open.item.id); const labOk2 = labPassed(db, me, open.item.id);
    if (vidOk && labOk2) return (<div className="fbk" style={{ borderLeftColor: "var(--pass)", background: "var(--passbg)", marginBottom: 14 }}><CheckCircle2 size={14} className="c-pass" style={{ verticalAlign: "-2px" }} /> Module complete — video watched and verified by the Virtual Lab.</div>);
    if (vidOk && !labOk2) return (<div className="note" style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}><Cpu size={14} className="c-teal" style={{ flex: "none", marginTop: 1 }} /><span>Video watched ✓ — now open the <b>Virtual Lab</b> tab and pass this module's Check to complete it.</span></div>);
    if (!vidOk && labOk2) return (<div className="note" style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}><Play size={14} className="c-teal" style={{ flex: "none", marginTop: 1 }} /><span>Lab Check passed ✓ — watch the video above to complete this module.</span></div>);
    return (<div className="note" style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}><Cpu size={14} className="c-teal" style={{ flex: "none", marginTop: 1 }} /><span>Watch the video above, then open the <b>Virtual Lab</b> tab and pass this module's Check — both are needed to complete this module.</span></div>); })()}
  {(() => { const qbank = (db.site.mcq?.[track] || {})[open.item.id] || []; if (!qbank.length) return null;
    const qres = db.submissions[subKey(me.id, "quiz", open.item.id)]; const qpassed = !!qres?.passed;
    return (<div className="divider-t" style={{ marginTop: 4, paddingTop: 16 }}>
      <button className="row-btn" onClick={() => setView("quiz")}><HelpCircle size={16} className="c-gold" /><span className="ink" style={{ flex: 1, fontSize: ".85rem", fontWeight: 600 }}>Module quiz <span className="faint" style={{ fontWeight: 400 }}>· {qbank.length} multiple-choice questions</span></span><Badge status={qpassed ? "Passed" : (qres ? "Failed" : "Not started")} /><ChevronRight size={16} className="faint" /></button>
    </div>); })()}
</>) : open.type === "hw" ? (<>
          <p className="ink" style={{ fontSize: ".875rem", marginBottom: 6 }}>{open.item.hw?.prompt}</p>
          <div className="note" style={{ marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}><Shield size={14} className="c-teal" style={{ flex: "none", marginTop: 1 }} /><span>Optional. Paste the firmware C source you ran on your board. Every submission is automatically <b>security-scanned for malware and unsafe operations</b> before it can be forwarded to the lab.</span></div>
          {s?.comment && (<div style={{ margin: "10px 0" }}><div className="lbl" style={{ display: "flex", alignItems: "center", gap: 6 }}><MessageSquare size={12} /> Mentor feedback</div><div className="fbk" style={{ whiteSpace: "pre-wrap" }}>{s.comment}</div></div>)}
          <Area label="Your hardware C / firmware code" rows={10} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder={"/* the firmware C you flashed and ran on the STM32 board */"} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><Btn onClick={submitHW} disabled={scanning}>{scanning ? <><ScanLine size={15} /> Scanning…</> : <><Shield size={15} /> Submit &amp; security-scan</>}</Btn><span className="faint" style={{ fontSize: 11 }}>Hardware tasks are optional and don't affect module completion.</span></div>
          {scanning && <div className="note" style={{ marginTop: 12 }}>Running malware &amp; threat analysis on your code…</div>}
          {scan && (<div className="fbk" style={{ marginTop: 14, borderLeftColor: scan.clean ? "var(--pass)" : "var(--fail)", background: scan.clean ? "var(--passbg)" : "var(--failbg)" }}>
            <div className="disp" style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: scan.clean ? "var(--pass)" : "var(--fail)" }}>{scan.clean ? <><ShieldCheck size={15} /> Security scan passed</> : <><ShieldAlert size={15} /> Flagged — held for manual review</>}</div>
            <div className="ink" style={{ fontSize: ".8rem", marginTop: 4 }}>Risk: <b>{scan.risk}</b>{scan.summary ? ` · ${scan.summary}` : ""}</div>
            {scan.findings?.length > 0 && <ul style={{ margin: "8px 0 0 18px", fontSize: ".78rem" }}>{scan.findings.map((f, i) => <li key={i} className="ink">{f}</li>)}</ul>}
            {!scan.clean && <div className="ink" style={{ fontSize: ".78rem", marginTop: 8 }}>Your code was not forwarded to the lab. Remove the flagged operations and resubmit.</div>}
          </div>)}
          <div style={{ marginTop: 14 }}><ReviewBox s={s} /></div>
        </>) : (<>
          <p className="ink" style={{ fontSize: ".875rem", marginBottom: 6 }}>{open.item.desc}</p>
          {open.item.submit && <p className="faint" style={{ fontSize: 12, marginBottom: 6 }}>Submit: {open.item.submit}</p>}
          {s?.comment && (<div style={{ margin: "10px 0" }}><div className="lbl" style={{ display: "flex", alignItems: "center", gap: 6 }}><MessageSquare size={12} /> Mentor feedback</div><div className="fbk" style={{ whiteSpace: "pre-wrap" }}>{s.comment}</div></div>)}
          <Area label="Submission (repo link · serial/CAN log · notes)" rows={4} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="https://github.com/… and any notes" />
          <Btn onClick={submitP}><Save size={15} /> Submit for grading</Btn>
          <div style={{ marginTop: 14 }}><ReviewBox s={s} /></div>
        </>)}
      </Card>); })() : (<>
        <div style={{ marginBottom: 28 }}><div className="muted" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".875rem", marginBottom: 12 }}><VideoIcon size={16} className="c-green" /> Modules — unlock in order (watch the video + pass the lab Check)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{mods.map((m, i) => { const lock = !unlocked(i); const cS = stat("c", m.id); const hwS = stat("hw", m.id); const hasHW = !!m.hw?.prompt; const done = cS === "Passed"; return (
            <Card key={m.id} style={{ padding: 14, opacity: lock ? .6 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: lock ? 0 : 10 }}><span className="mono faint" style={{ fontSize: 12, width: 24 }}>{String(i + 1).padStart(2, "0")}</span><span className="ink" style={{ flex: 1, fontSize: ".9rem", fontWeight: 600 }}>{m.title}</span>{labProg[labPosKey(db, me, m.id)] && <span className="pill pill-green" title="Lab module passed"><Cpu size={11} /> Lab ✓</span>}{done ? <Badge status="Passed" /> : lock ? <span className="pill" style={{ background: "#eef2f1", color: "var(--muted)" }}><Lock size={11} /> Locked</span> : <Badge status={cS} />}</div>
              {lock ? <div className="muted" style={{ fontSize: 12, paddingLeft: 34, marginTop: 6 }}><Lock size={11} style={{ verticalAlign: "-1px" }} /> Pass the C task of Module {i} to unlock this.</div> : (<div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 34 }}>
                <button className="row-btn" onClick={() => openC(m)}><VideoIcon size={14} className="c-green" /><span className="ink" style={{ flex: 1, fontSize: ".82rem" }}>Watch &amp; learn <span className="faint">· video lessons for this module</span></span><Badge status={cS} /><ChevronRight size={15} className="faint" /></button>
                {done && (() => { const qbank = (db.site.mcq?.[track] || {})[m.id] || []; const qres = db.submissions[subKey(me.id, "quiz", m.id)]; const qpassed = !!qres?.passed;
                  return qbank.length > 0 ? (<button className="row-btn" onClick={() => setView("quiz")}><HelpCircle size={14} className="c-gold" /><span className="ink" style={{ flex: 1, fontSize: ".82rem" }}>Module quiz <span className="faint">· {qbank.length} MCQs · required to sharpen interview-readiness</span></span><Badge status={qpassed ? "Passed" : (qres ? "Failed" : "Not started")} /><ChevronRight size={15} className="faint" /></button>) : null; })()}
              </div>)}
            </Card>); })}</div>
        </div>
        <div style={{ marginBottom: 8 }}><div className="muted" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".875rem", marginBottom: 12 }}><FolderKanban size={16} className="c-green" /> Build projects {(modulesDone && labOk) ? "" : <span className="pill" style={{ background: "#eef2f1", color: "var(--muted)" }}><Lock size={11} /> Locked</span>}</div>{(modulesDone && labOk) ? (<>{(() => { const paper = assignedPaper(db, me); return paper ? (<Card style={{ padding: 16, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><FileText size={20} className="c-teal" /><div><div className="disp head" style={{ fontWeight: 600, fontSize: ".9rem" }}>Your project question paper</div><div className="faint" style={{ fontSize: 12 }}>{paper.name}</div></div></div><Btn onClick={async () => { try { const res = await window.storage.get(`caee:projpdf:${paper.id}`, true); if (!res?.value) return flash("Paper not available yet"); const a = document.createElement("a"); a.href = res.value; a.download = paper.name; a.click(); } catch (e) { flash("Could not load paper"); } }}><Download size={15} /> Download paper</Btn></Card>) : null; })()}<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{projs.map((p, i) => { const s = sub("p", p.id); return (<button key={p.id} className="row-btn" onClick={() => openP(p)}><span className="mono faint" style={{ fontSize: 12, width: 24 }}>P{i + 1}</span><span className="ink" style={{ flex: 1, fontSize: ".875rem" }}>{p.title}</span>{s?.comment && <MessageSquare size={14} className="c-teal" />}<Badge status={stat("p", p.id)} /><ChevronRight size={16} className="faint" /></button>); })}</div></>) : (<Card style={{ padding: 20, textAlign: "center" }}><Lock size={26} className="c-gold" style={{ margin: "0 auto 8px" }} /><div className="ink" style={{ fontSize: ".875rem", fontWeight: 600 }}>Projects unlock after all {mods.length - 1} modules{labRequired ? " + the virtual lab" : ""}</div><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>You've passed {mods.slice(1).filter((m) => stat("c", m.id) === "Passed").length} of {mods.length - 1} modules{labRequired ? ` and ${labModsDone} of ${labModCount} lab modules (Virtual Lab tab)` : ""}. Finish them all to open the build projects.</div></Card>)}</div>
      </>)}
      <div className="note" style={{ marginTop: 14 }}><ShieldAlert size={12} style={{ verticalAlign: "-2px" }} /> This course material is confidential and watermarked to your account. Sharing or capturing it is prohibited.</div>
      </>)}
    </div>
    <div style={{ height: 62 }} className="bottomnav-spacer" />
    <div className="bottomnav">
      <button className={tab === "work" ? "on" : ""} onClick={() => { setTab("work"); setOpen(null); }}><FolderKanban size={18} /> Modules</button>
      <button className={tab === "lab" ? "on" : ""} onClick={() => { setTab("lab"); setOpen(null); }}><Cpu size={18} /> Lab</button>
      <button className={tab === "discuss" ? "on" : ""} style={{ position: "relative" }} onClick={() => { setTab("discuss"); setOpen(null); markSeen(); }}><span style={{ position: "relative" }}><MessageSquare size={18} />{unread > 0 && <span className="reddot" />}</span> Doubts</button>
      <button onClick={() => setView("student")}><GraduationCap size={18} /> My course</button>
    </div>
  </div>);
}
const Stat = ({ label, value, accent }) => (<Card style={{ padding: "12px 20px", textAlign: "center", minWidth: 96 }}><div className={`disp ${accent ? "c-fail" : "c-green"}`} style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div><div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div></Card>);

/* ================= CERTIFICATE ================= */
function CourseHub({ db, session, setView }) {
  const me = db.users.find((u) => u.id === session.id) || session;
  const hubStreak = useStreak(me.id);
  const rla = rlAccess(db, me);
  if (me.labOnly || (!me.access && rla.status !== "None")) return <RemoteLabWorkspace db={db} session={session} setView={setView} />;
  if (!me.access) return <AccessPending />;
  const track = me.track || "btech"; const T = TRACK[track];
  const mods = db.questions[track]; const projs = db.projects[track];
  const passed = mods.slice(1).filter((m) => db.submissions[subKey(me.id, "c", m.id)]?.status === "Passed").length + projs.filter((p) => db.submissions[subKey(me.id, "p", p.id)]?.status === "Passed").length;
  const total = mods.slice(1).length + projs.length; const complete = allPassed(db, me); // Module 0 (intro videos) is informational, excluded from the completion count
  const cards = [
    { icon: FileCode, title: "Programming & Projects", desc: `${mods.length - 1} modules + ${projs.length} projects — mentor-reviewed C, hardware tasks and project-lead review.`, to: "learn", tag: `${passed}/${total} done` },
    { icon: HelpCircle, title: "Interview Questions", desc: "Multiple-choice questions for every module to sharpen your technical interviews.", to: "quiz" },
    { icon: FileText, title: "Resume & LinkedIn Prep", desc: "Turn your CAEE work into a resume and LinkedIn profile recruiters notice.", to: "resume" },
    { icon: TrendingUp, title: "Career Roadmap & Resources", desc: "A step-by-step path to placement plus curated datasheets and tools.", to: "career" },
  ];
  if (rla.status !== "None") cards.push({ icon: Cpu, title: "STM32 Remote Lab", desc: "Automotive ECU engineering projects on real NUCLEO-G474RE hardware over CAN-A / CAN-B.", to: "rlab", tag: rla.ok ? (rla.days != null ? `${rla.days} days left` : "Active") : rla.status });
  return (<div className="max-w-5xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 40 }}>
    <div className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>{T.tag} track</div>
    <h1 className="disp head" style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 4 }}>Welcome back, {me.name.split(" ")[0]}</h1>
    <p className="muted" style={{ fontSize: ".9rem", marginBottom: 14 }}>{T.name}</p>
    <Card style={{ padding: 16, marginBottom: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <Ring pct={total ? (passed / total) * 100 : 0} size={70} label="course" />
      <div style={{ flex: 1, minWidth: 200 }}><div className="ink" style={{ fontWeight: 700, fontSize: ".95rem" }}>You're {total ? Math.round((passed / total) * 100) : 0}% through {T.tag}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{passed} of {total} modules &amp; projects complete — keep the momentum going.</div><div style={{ marginTop: 8 }}><Badges items={mods.map((m, i) => ({ label: i === 0 ? "Intro" : "M" + i, done: db.submissions[subKey(me.id, "c", m.id)]?.status === "Passed" }))} /></div></div>
      <StreakChip n={hubStreak} />
    </Card>
    <div className="grid sm:grid-cols-2 gap-5">{cards.map((c) => { const Ic = c.icon; return (<button key={c.to} className="card" onClick={() => setView(c.to)} style={{ padding: 22, textAlign: "left", cursor: "pointer", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}><div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--tint)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={20} className="c-teal" /></div>{c.tag && <span className="pill pill-green">{c.tag}</span>}</div>
      <div className="disp head" style={{ fontWeight: 600, fontSize: "1.05rem" }}>{c.title}</div>
      <div className="muted" style={{ fontSize: ".85rem", marginTop: 6, lineHeight: 1.5 }}>{c.desc}</div>
      <div className="c-green" style={{ fontSize: ".8rem", fontWeight: 600, marginTop: 14, display: "flex", alignItems: "center", gap: 4 }}>Open <ChevronRight size={14} /></div>
    </button>); })}</div>
    {complete && <Card style={{ padding: 18, marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: "var(--passbg)", borderColor: "rgba(31,157,87,.35)" }}><div style={{ display: "flex", gap: 10, alignItems: "center" }}><Award size={22} className="c-pass" /><span className="ink" style={{ fontSize: ".9rem", fontWeight: 600 }}>You've finished everything — claim your certificate.</span></div><Btn kind="good" onClick={() => setView("results")}><Award size={15} /> Certificate</Btn></Card>}
  </div>);
}
function Quiz({ db, commit, session, setView, flash }) {
  const me = db.users.find((u) => u.id === session.id) || session; if (!me.access) return <AccessPending />;
  const track = me.track || "btech"; const mods = db.questions[track]; const bank = db.site.mcq?.[track] || {};
  const res = (mid) => db.submissions[subKey(me.id, "quiz", mid)];
  const passedMod = (mid) => !!res(mid)?.passed;
  const unlocked = (i) => i <= 1 || passedMod(mods[i - 1].id); // i<=1: Module 0 (intro videos, no challenge) and the first real module are always open
  const firstOpen = (() => { const i = mods.findIndex((m, idx) => unlocked(idx) && !passedMod(m.id)); return mods[i >= 0 ? i : 0]?.id || null; })();
  const [modId, setModId] = useState(firstOpen); const [ans, setAns] = useState({}); const [submitted, setSubmitted] = useState(false);
  const idx = mods.findIndex((m) => m.id === modId);
  const list = modId ? (bank[modId] || []) : [];
  const need = Math.max(1, Math.ceil(list.length * 0.6));
  const score = list.reduce((n, qq) => n + (ans[qq.id] === qq.answer ? 1 : 0), 0);
  const prevRes = modId ? res(modId) : null;
  const openMod = (m, i) => { if (!unlocked(i)) return flash("Finish the previous set first to unlock this one."); setModId(m.id); setAns({}); setSubmitted(false); };
  const submit = () => { const pass = score >= need; setSubmitted(true); const k = subKey(me.id, "quiz", modId); const prev = db.submissions[k] || {}; commit({ ...db, submissions: { ...db.submissions, [k]: { ...prev, best: Math.max(prev.best || 0, score), total: list.length, passed: !!prev.passed || pass, attempts: (prev.attempts || 0) + 1, at: TODAY() } } }); flash(pass ? "✓ Passed — next set unlocked" : `Need ${need}/${list.length} to pass — reattempt`); };
  return (<div className="max-w-3xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 40 }}>
    <div style={{ marginBottom: 16 }}><BackLink onClick={() => setView("student")} /></div>
    <SectionTitle icon={HelpCircle} k="Interview prep" t="Interview questions" />
    <p className="faint" style={{ fontSize: 12, marginBottom: 14 }}>Drip system — score {Math.round(0.6 * 100)}%+ on a set to unlock the next module. Reattempt as many times as you like.</p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>{mods.map((m, i) => { const lock = !unlocked(i); const done = passedMod(m.id); const n = bank[m.id]?.length || 0; return (<button key={m.id} className={`toggle ${modId === m.id ? "on" : ""}`} onClick={() => openMod(m, i)} style={lock ? { opacity: .55 } : {}}>{lock ? <Lock size={11} /> : done ? <Check size={11} className="c-pass" /> : null} {i === 0 ? "Intro" : "M" + i}{n ? ` · ${n}` : ""}</button>); })}</div>
    {!modId ? null : list.length === 0 ? <Empty msg="No interview questions for this module yet — check back soon." /> : idx > 0 && !unlocked(idx) ? <Empty msg="Locked — finish the previous set to unlock this one." /> : (<>
      <div className="muted" style={{ fontSize: 12, marginBottom: 12, display: "flex", justifyContent: "space-between" }}><span>{submitted ? `Score ${score}/${list.length} · need ${need} to pass` : `${Object.keys(ans).length}/${list.length} answered`}</span>{prevRes && <span>Best: {prevRes.best}/{prevRes.total}{prevRes.passed ? " · passed" : ""}</span>}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{list.map((qq, qi) => (<Card key={qq.id} style={{ padding: 18 }}>
        <div className="ink" style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 10 }}>{qi + 1}. {qq.q}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{qq.options.map((op, oi) => { const chosen = ans[qq.id] === oi; const correct = submitted && oi === qq.answer; const wrong = submitted && chosen && oi !== qq.answer; return (<button key={oi} className="row-btn" onClick={() => { if (!submitted) setAns({ ...ans, [qq.id]: oi }); }} style={{ borderColor: correct ? "var(--pass)" : wrong ? "var(--fail)" : chosen ? "var(--green)" : "var(--border)", background: correct ? "var(--passbg)" : wrong ? "var(--failbg)" : "#fff" }}><span className="tickbox" style={{ borderRadius: 999, ...(chosen ? { background: "var(--green)", borderColor: "var(--green)" } : {}) }}>{chosen && <Check size={11} color="#fff" />}</span><span className="ink" style={{ flex: 1, fontSize: ".85rem" }}>{op}</span>{correct && <Check size={15} className="c-pass" />}{wrong && <X size={15} className="c-fail" />}</button>); })}</div>
        {submitted && qq.explain && <div className="note" style={{ marginTop: 10 }}>{qq.explain}</div>}
      </Card>))}</div>
      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{!submitted ? <Btn onClick={submit} disabled={Object.keys(ans).length < list.length}><Check size={15} /> Submit answers</Btn> : (<><div className={`disp ${score >= need ? "c-pass" : "c-fail"}`} style={{ fontWeight: 700 }}>{score >= need ? "Passed" : "Not yet"} — {score}/{list.length}</div><Btn kind="ghost" onClick={() => { setAns({}); setSubmitted(false); }}>Reattempt</Btn>{score >= need && idx < mods.length - 1 && <Btn onClick={() => openMod(mods[idx + 1], idx + 1)}>Next set <ChevronRight size={15} /></Btn>}</>)}</div>
    </>)}
  </div>);
}
function ResumePage({ db, session, setView }) {
  const me = db.users.find((u) => u.id === session.id) || session; if (!me.access) return <AccessPending />;
  const items = db.site.resume || [];
  return (<div className="max-w-3xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 40 }}>
    <div style={{ marginBottom: 16 }}><BackLink onClick={() => setView("student")} /></div>
    <SectionTitle icon={FileText} k="Career" t="Resume & LinkedIn prep" />
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{items.map((s) => (<Card key={s.id} style={{ padding: 18 }}><div className="disp head" style={{ fontWeight: 600, marginBottom: 6 }}>{s.title}</div><div className="ink" style={{ fontSize: ".88rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{s.body}</div></Card>))}</div>
    {db.site.mentor?.email && <Card style={{ padding: 16, marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><MessageSquare size={18} className="c-teal" /><span className="ink" style={{ fontSize: ".85rem" }}>Want a review? Email your mentor at <a href={`mailto:${db.site.mentor.email}`} className="c-green">{db.site.mentor.email}</a>.</span></Card>}
  </div>);
}
function CareerPage({ db, session, setView }) {
  const me = db.users.find((u) => u.id === session.id) || session; if (!me.access) return <AccessPending />;
  const road = db.site.career?.roadmap || []; const res = db.site.career?.resources || [];
  return (<div className="max-w-3xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 40 }}>
    <div style={{ marginBottom: 16 }}><BackLink onClick={() => setView("student")} /></div>
    <SectionTitle icon={TrendingUp} k="Career" t="Career roadmap & resources" />
    <div className="lbl" style={{ marginBottom: 8 }}>Your roadmap to placement</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>{road.map((r, i) => (<div key={r.id} className="step"><div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}><div className="stepnum">{i + 1}</div><div className="disp head" style={{ fontWeight: 600, fontSize: ".95rem" }}>{r.step}</div></div><div className="muted" style={{ fontSize: ".82rem", lineHeight: 1.5 }}>{r.desc}</div></div>))}</div>
    <div className="lbl" style={{ marginBottom: 8 }}>Resources &amp; datasheets</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{res.map((r) => (<a key={r.id} className="row-btn" href={r.url} target="_blank" rel="noreferrer"><FileText size={15} className="c-teal" /><span style={{ flex: 1 }}><span className="ink" style={{ fontSize: ".85rem", fontWeight: 600 }}>{r.title}</span>{r.note && <span className="muted" style={{ fontSize: 12, display: "block" }}>{r.note}</span>}</span><ChevronRight size={15} className="faint" /></a>))}</div>
  </div>);
}
function certSVG(u, dateStr, kind = "internship") {
  const T = TRACK[u.track] || TRACK.btech; const W = 1123, H = 794;
  const id = kind === "workshop" ? `CAEE-WS-${(u.email || u.name || "x").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}` : certId(u);
  const heading = kind === "workshop" ? "Certificate of Participation" : "Certificate of Completion";
  const body = kind === "workshop"
    ? `has attended the 2-day ${T.tag} workshop — ${T.name} — at the Centre for Automotive Embedded Engineering (CAEE) and passed the workshop assessment.`
    : `has successfully completed the ${T.tag} internship — ${T.name} — at the Centre for Automotive Embedded Engineering (CAEE), and has demonstrated the ability to ${T.skill}.`;
  const dateLabel = kind === "workshop" ? "Date of issue" : "Date of completion";
  const words = body.split(" "); const lines = []; let cur = ""; for (const w of words) { if ((cur + " " + w).trim().length > 74) { lines.push(cur.trim()); cur = w; } else cur += " " + w; } if (cur.trim()) lines.push(cur.trim());
  const esc = (x) => String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const bodyT = lines.map((l, i) => `<text x="${W / 2}" y="${424 + i * 30}" text-anchor="middle" font-family="Georgia, serif" font-size="19" fill="#3a4a48">${esc(l)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/><rect x="0" y="0" width="${W}" height="14" fill="#0a5757"/><rect x="0" y="14" width="${W}" height="5" fill="#e8b84b"/><rect x="0" y="${H - 14}" width="${W}" height="14" fill="#0a5757"/><rect x="0" y="${H - 19}" width="${W}" height="5" fill="#e8b84b"/><rect x="34" y="40" width="${W - 68}" height="${H - 92}" fill="none" stroke="#2ba665" stroke-width="2"/><rect x="44" y="50" width="${W - 88}" height="${H - 112}" fill="none" stroke="#dce8e6" stroke-width="1"/><text x="${W / 2}" y="118" text-anchor="middle" font-family="Georgia, serif" font-size="15" letter-spacing="6" fill="#0a5757">CENTRE FOR AUTOMOTIVE EMBEDDED ENGINEERING</text><text x="${W / 2}" y="196" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="52" fill="#143230">${heading}</text><line x1="${W / 2 - 90}" y1="221" x2="${W / 2 + 90}" y2="221" stroke="#e8b84b" stroke-width="3"/><text x="${W / 2}" y="284" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#5c7878">This is to certify that</text><text x="${W / 2}" y="349" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="44" fill="#2ba665">${esc(u.name)}</text>${bodyT}<text x="300" y="654" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="20" fill="#143230">Mabi Nadaf</text><line x1="200" y1="666" x2="400" y2="666" stroke="#0a5757" stroke-width="1"/><text x="300" y="688" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#5c7878">Founder &amp; Director, CAEE</text><text x="823" y="654" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#143230">${dateStr}</text><line x1="723" y1="666" x2="923" y2="666" stroke="#0a5757" stroke-width="1"/><text x="823" y="688" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#5c7878">${dateLabel}</text><circle cx="${W / 2}" cy="660" r="42" fill="#e8b84b"/><circle cx="${W / 2}" cy="660" r="34" fill="#0a5757"/><text x="${W / 2}" y="657" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#e8b84b">CAEE</text><text x="${W / 2}" y="674" text-anchor="middle" font-family="Georgia, serif" font-size="8" fill="#fff">CERTIFIED</text><text x="${W / 2}" y="730" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#8aa6a1">Certificate ID: ${id}  ·  verify at the CAEE portal</text></svg>`;
}
function Workshop({ db, commit, track, setView, flash }) {
  const wsStreakUid = "ws"; // per-device workshop streak (works before registration too)
  const ws = db.site.workshop || {}; const cfg = (ws[track]) || { packs: [], title: "", intro: "" }; const T = TRACK[track];
  const deadlinePassed = ws.deadline && new Date(ws.deadline) < new Date(new Date().toDateString());
  const closed = ws.open === false || deadlinePassed;
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", college: "", status: "Student" });
  const [resumeEmail, setResumeEmail] = useState("");
  const [testQs, setTestQs] = useState(null); const [ans, setAns] = useState({}); const [submitted, setSubmitted] = useState(false);
  const [packAns, setPackAns] = useState({}); const [openQuiz, setOpenQuiz] = useState({}); const [wsBoard, setWsBoard] = useState(false); const wsStreak = useStreak("ws:" + track);
  const [chCode, setChCode] = useState({}); const [chResult, setChResult] = useState({}); const [chBusy, setChBusy] = useState({});
  const [hidden, setHidden] = useState(false);
  const wsHydrated = useRef(false);
  useProtect(true);
  useEffect(() => { const onVis = () => setHidden(document.hidden); document.addEventListener("visibilitychange", onVis); return () => document.removeEventListener("visibilitychange", onVis); }, []);
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
  const phoneOk = form.phone.replace(/\D/g, "").length >= 10;
  const set = (k, v) => setForm({ ...form, [k]: v });

  // Remember who's logged in on THIS device, so reopening the site (or
  // reloading the page) doesn't drop the student back to the registration
  // screen — this used to live only in memory and was forgotten immediately.
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(`ws:${track}:me`, false);
        if (!r?.value) return;
        const saved = JSON.parse(r.value);
        const reg = (db.workshopRegs || []).find((x) => x.track === track && x.email === saved.email);
        if (reg) setMe({ name: reg.name, email: reg.email });
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);
  const rememberMe = (name, email) => { try { window.storage.set(`ws:${track}:me`, JSON.stringify({ email }), false); } catch (e) {} };

  // Load this student's saved quiz/challenge progress once we know who they
  // are, then keep it saved centrally (not just in this tab) whenever it
  // changes — previously packAns/chResult lived only in React state and
  // were wiped on every reload, so "completed" modules kept un-completing.
  useEffect(() => {
    if (!me) return;
    const saved = ((db.workshopProgress || {})[track] || {})[me.email];
    setPackAns(saved?.packAns || {});
    setChResult(saved?.chResult || {});
    wsHydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);
  useEffect(() => {
    if (!me || !wsHydrated.current) return;
    const all = { ...(db.workshopProgress || {}) };
    const byTrack = { ...(all[track] || {}) };
    byTrack[me.email] = { packAns, chResult, updatedAt: NOW() };
    all[track] = byTrack;
    commit({ ...db, workshopProgress: all });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packAns, chResult]);

  const register = () => {
    if (!form.name.trim()) return flash("Enter your name");
    if (!emailOk) return flash("Enter a valid email address");
    if (!phoneOk) return flash("Enter a valid phone number (10+ digits)");
    const reg = { id: uid(), track, name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), college: form.college.trim(), status: form.status, at: NOW() };
    const exists = (db.workshopRegs || []).some((r) => r.track === track && r.email === reg.email);
    if (!exists) commit({ ...db, workshopRegs: [reg, ...(db.workshopRegs || [])] });
    setMe({ name: reg.name, email: reg.email });
    rememberMe(reg.name, reg.email);
    flash("Registered — your workshop is unlocked below");
  };
  const resume = () => {
    const e = resumeEmail.trim().toLowerCase();
    const r = (db.workshopRegs || []).find((x) => x.track === track && x.email === e);
    if (!r) return flash("No registration found for that email on this track");
    setMe({ name: r.name, email: r.email });
    rememberMe(r.name, r.email);
  };

  const bank = (cfg.packs || []).flatMap((p) => p.mcq || []);
  const count = Math.min(ws.finalCount || 20, bank.length);
  const passPct = ws.passPct || 70;
  const startTest = () => {
    if (bank.length < 4) return flash("The assessment isn't ready for this track yet.");
    setTestQs([...bank].sort(() => Math.random() - 0.5).slice(0, count)); setAns({}); setSubmitted(false);
  };
  const score = testQs ? testQs.reduce((n, q) => n + (ans[q.id] === q.answer ? 1 : 0), 0) : 0;
  const need = testQs ? Math.ceil(testQs.length * (passPct / 100)) : 0;
  const passed = submitted && score >= need;

  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const svg = me ? certSVG({ name: me.name, email: me.email, track }, dateStr, "workshop") : "";
  const downloadCert = () => { const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" }); const url = URL.createObjectURL(blob); const img = new Image(); img.onload = () => { const sc = 2, c = document.createElement("canvas"); c.width = 1123 * sc; c.height = 794 * sc; const ctx = c.getContext("2d"); ctx.scale(sc, sc); ctx.drawImage(img, 0, 0, 1123, 794); URL.revokeObjectURL(url); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `CAEE-Workshop-${me.name.replace(/\s+/g, "-")}.png`; a.click(); }; img.src = url; };

  return (<div className="max-w-4xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 48, position: "relative" }}>
    {me && <Watermark text={me.email} />}
    {me && hidden && <div className="blurcover"><ShieldAlert size={30} /><span style={{ marginTop: 10 }}>Paused — return to the tab to continue</span></div>}
    <div style={{ marginBottom: 16 }}><BackLink onClick={() => setView("public")} /></div>
    <div className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>Free 2-day workshop · {T.tag}</div>
    <h1 className="disp head" style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 6 }}>{cfg.title}</h1>
    <p className="muted" style={{ fontSize: ".9rem", marginBottom: 20 }}>{cfg.intro}</p>

    {!me ? (
      <Card style={{ padding: 26 }}>
        {closed ? (<div className="fbk" style={{ borderLeftColor: "var(--gold)", background: "#fff7e6", marginBottom: 16 }}>Registration is currently closed{ws.deadline ? ` (ended ${ws.deadline})` : ""}. If you already registered, resume below.</div>) : (<>
          <h3 className="disp head" style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>Register to unlock the workshop</h3>
          <p className="muted" style={{ fontSize: ".84rem", marginBottom: 14 }}>{ws.deadline ? `Free registration ends on ${ws.deadline}.` : "Free registration."} Tell us a bit about you and the workshop unlocks right here.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            <Field label="Email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
            <Field label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-digit mobile" />
            <Field label="College / University" value={form.college} onChange={(e) => set("college", e.target.value)} />
          </div>
          <div style={{ marginTop: 4 }}><span className="lbl">You are currently a</span>
            <select className="sel" value={form.status} onChange={(e) => set("status", e.target.value)}><option>Student</option><option>Employed</option><option>Looking for a job</option><option>Other</option></select>
          </div>
          <Btn onClick={register} style={{ marginTop: 14 }}><GraduationCap size={15} /> Register &amp; unlock</Btn>
          <p className="faint" style={{ fontSize: 11, marginTop: 8 }}>We verify the format of your email and phone here. In the live site you'll confirm via a one-time code (OTP) to your phone/email.</p>
        </>)}
        <div className="divider" style={{ margin: "18px 0 12px" }} />
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}><Field label="Already registered? Resume with your email" value={resumeEmail} onChange={(e) => setResumeEmail(e.target.value)} placeholder="you@email.com" /></div>
          <Btn kind="ghost" onClick={resume}>Resume</Btn>
        </div>
      </Card>
    ) : (<>
      <div className="fbk" style={{ borderLeftColor: "var(--pass)", background: "var(--passbg)", marginBottom: 18 }}><CheckCircle2 size={14} className="c-pass" style={{ verticalAlign: "-2px" }} /> Welcome, {me.name.split(" ")[0]} — your workshop is unlocked. Watch the lessons, then take the final assessment.</div>

      {(() => {
        const packs = cfg.packs || [];
        const packDone = (p) => { if (p.challenge) return chResult[p.id] === "pass"; const qs = p.mcq || []; return qs.length > 0 && qs.every((q) => packAns[p.id] && packAns[p.id][q.id] !== undefined); };
        const done = packs.filter(packDone).length;
        const pct = packs.length ? Math.round((done / packs.length) * 100) : 0;
        const dlPdf = async (p) => { try { const r = await window.storage.get(`caee:wspdf:${p.id}`, true); if (!r?.value) return flash("Notes not available yet"); const a = document.createElement("a"); a.href = r.value; a.download = p.pdfName || "notes.pdf"; a.click(); } catch (e) { flash("Could not load notes"); } };
        return (<>
          <div style={{ marginBottom: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span className="lbl">Workshop progress</span><span className="mono c-green" style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</span></div><div style={{ height: 10, background: "#e3ece9", borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: "var(--green)", transition: "width .3s" }} /></div><div className="faint" style={{ fontSize: 11, marginTop: 4 }}>{done} of {packs.length} modules completed (answer every quiz question in a module to complete it)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}><StreakChip n={wsStreak} /><Badges items={packs.map((p, i) => ({ label: "M" + (i + 1), done: packDone(p) }))} /></div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>{packs.map((p, i) => { const qs = p.mcq || []; const isOpen = !!openQuiz[p.id]; const ansd = Object.keys(packAns[p.id] || {}).length; return (<Card key={p.id} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}><div className="disp head" style={{ fontWeight: 600, fontSize: ".98rem", flex: 1 }}>{p.title || `Module ${i + 1}`}</div>{packDone(p) && <span className="pill pill-green"><Check size={11} /> Done</span>}</div>
            <MediaViewer item={p} legacyPdfKey={`caee:wspdf:${p.id}`} flash={flash} height={300} emptyLabel="Video coming soon" />
            {p.note && <p className="ink" style={{ fontSize: ".85rem", marginTop: 10, lineHeight: 1.5 }}>{p.note}</p>}
            {p.challenge && (<div style={{ marginTop: 12 }}>
              <div className="lbl" style={{ marginBottom: 6 }}>No video yet — complete this module by writing and running the code below</div>
              <textarea className="input" spellCheck={false} rows={10} style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5 }}
                value={chCode[p.id] !== undefined ? chCode[p.id] : p.challenge.starter}
                onChange={(e) => { setChCode({ ...chCode, [p.id]: e.target.value }); setChResult({ ...chResult, [p.id]: null }); }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <Btn sm onClick={async () => {
                  const compileUrl = (db.site.labs && db.site.labs.compile) || "";
                  if (!compileUrl) { setChResult({ ...chResult, [p.id]: "noserver" }); return; }
                  setChBusy({ ...chBusy, [p.id]: true }); setChResult({ ...chResult, [p.id]: null });
                  try {
                    const src = (chCode[p.id] !== undefined ? chCode[p.id] : p.challenge.starter) + "\n" + p.challenge.harness;
                    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
                    const r = await fetch(compileUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: src }), signal: controller.signal });
                    clearTimeout(timer);
                    const j = await r.json();
                    const pass = !!(j.ok && j.output && !j.output.includes("FAIL"));
                    setChResult({ ...chResult, [p.id]: pass ? "pass" : "fail" });
                  } catch (e) { setChResult({ ...chResult, [p.id]: "error" }); }
                  setChBusy({ ...chBusy, [p.id]: false });
                }} disabled={!!chBusy[p.id]}><Play size={13} /> {chBusy[p.id] ? "Running…" : "Run & check"}</Btn>
                {chResult[p.id] === "pass" && <span className="pill pill-green"><Check size={11} /> All tests passed — module complete</span>}
                {chResult[p.id] === "fail" && <span className="pill" style={{ background: "var(--failbg)", color: "var(--fail)" }}><X size={11} /> Not passing yet — keep going</span>}
                {chResult[p.id] === "noserver" && <span className="faint" style={{ fontSize: 12 }}>No compiler connected yet — ask an admin to add one in Settings.</span>}
                {chResult[p.id] === "error" && <span className="faint" style={{ fontSize: 12 }}>Could not reach the compiler — try again.</span>}
              </div>
            </div>)}
            {qs.length > 0 && (<div style={{ marginTop: 12 }}>
              <Btn kind="ghost" sm onClick={() => setOpenQuiz({ ...openQuiz, [p.id]: !isOpen })}><HelpCircle size={13} /> {isOpen ? "Hide" : "Open"} module quiz ({qs.length} questions){ansd > 0 && !isOpen ? ` · ${ansd}/${qs.length}` : ""}</Btn>
              {isOpen && (<div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>{qs.map((q, qi) => { const chosen = packAns[p.id]?.[q.id]; return (<div key={q.id} className="tint" style={{ padding: 10, borderRadius: 10 }}>
                <div className="ink" style={{ fontWeight: 600, fontSize: ".84rem", marginBottom: 6 }}>{qi + 1}. {q.q}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>{q.options.map((op, oi) => { const pick = chosen === oi; const correct = chosen !== undefined && oi === q.answer; const wrong = pick && oi !== q.answer; return (<button key={oi} className="row-btn" onClick={() => setPackAns({ ...packAns, [p.id]: { ...(packAns[p.id] || {}), [q.id]: oi } })} style={{ borderColor: correct ? "var(--pass)" : wrong ? "var(--fail)" : "var(--border)", background: correct ? "var(--passbg)" : wrong ? "var(--failbg)" : "#fff" }}><span className="ink" style={{ flex: 1, fontSize: ".82rem" }}>{op}</span>{correct && <Check size={13} className="c-pass" />}{wrong && <X size={13} className="c-fail" />}</button>); })}</div>
                {chosen !== undefined && q.explain && <div className="note" style={{ marginTop: 6 }}>{q.explain}</div>}
              </div>); })}</div>)}
            </div>)}
          </Card>); })}</div>
        </>);
      })()}

      {me && (<div style={{ marginBottom: 22 }}>
        <Btn kind={wsBoard ? "primary" : "ghost"} onClick={() => setWsBoard(!wsBoard)}><MessageSquare size={14} /> {wsBoard ? "Hide" : "Open"} Doubts</Btn>
        {wsBoard && <div style={{ marginTop: 14 }}><TicketBoard db={db} commit={commit} board={`ws:${track}`} who={{ name: me.name, email: me.email }} flash={flash} trackName={TRACK[track].name + " workshop"} /></div>}
      </div>)}

      <Card style={{ padding: 22 }}>
        <h3 className="disp head" style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>Final assessment</h3>
        <p className="muted" style={{ fontSize: ".84rem", marginBottom: 12 }}>{count} questions · score {passPct}% to earn your free certificate · unlimited reattempts.</p>
        {!testQs ? <Btn onClick={startTest}><Play size={15} /> Start the assessment</Btn> : (<>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{testQs.map((q, qi) => (<div key={q.id} className="tint" style={{ padding: 14, borderRadius: 12 }}>
            <div className="ink" style={{ fontWeight: 600, fontSize: ".88rem", marginBottom: 8 }}>{qi + 1}. {q.q}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{q.options.map((op, oi) => { const chosen = ans[q.id] === oi; const correct = submitted && oi === q.answer; const wrong = submitted && chosen && oi !== q.answer; return (<button key={oi} className="row-btn" onClick={() => { if (!submitted) setAns({ ...ans, [q.id]: oi }); }} style={{ borderColor: correct ? "var(--pass)" : wrong ? "var(--fail)" : chosen ? "var(--green)" : "var(--border)", background: correct ? "var(--passbg)" : wrong ? "var(--failbg)" : "#fff" }}><span className="tickbox" style={{ borderRadius: 999, ...(chosen ? { background: "var(--green)", borderColor: "var(--green)" } : {}) }}>{chosen && <Check size={11} color="#fff" />}</span><span className="ink" style={{ flex: 1, fontSize: ".84rem" }}>{op}</span>{correct && <Check size={14} className="c-pass" />}{wrong && <X size={14} className="c-fail" />}</button>); })}</div>
          </div>))}</div>
          <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {!submitted ? <Btn onClick={() => setSubmitted(true)} disabled={Object.keys(ans).length < testQs.length}><Check size={15} /> Submit</Btn>
              : (<><div className={`disp ${passed ? "c-pass" : "c-fail"}`} style={{ fontWeight: 700 }}>{passed ? "Passed" : "Not yet"} — {score}/{testQs.length} (need {need})</div><Btn kind="ghost" onClick={startTest}>Reattempt</Btn></>)}
          </div>
        </>)}
      </Card>

      {passed && (<><Card style={{ padding: 16, overflow: "auto", marginTop: 18 }}><div style={{ minWidth: 560 }} dangerouslySetInnerHTML={{ __html: svg }} /></Card>
        <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}><Btn onClick={downloadCert}><Download size={15} /> Download certificate (PNG)</Btn></div>
        <Card style={{ padding: 20, marginTop: 18, background: "var(--tint)", borderColor: "rgba(31,139,139,.3)" }}>
          <div className="disp head" style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>Ready to do this for real?</div>
          <p className="ink" style={{ fontSize: ".86rem", marginBottom: 12 }}>The free workshop showed you the idea in simulation. The full {T.tag} internship takes you to real STM32 hardware, guided projects, a verifiable internship certificate, and placement support.</p>
          <Btn onClick={() => setView(track)}>Explore the full {T.tag} internship <ChevronRight size={15} /></Btn>
        </Card>
      </>)}
    </>)}
  </div>);
}
function MiniMCQ({ q }) {
  const [pick, setPick] = useState(null);
  return (<div style={{ marginBottom: 10 }}><div className="ink" style={{ fontSize: ".84rem", fontWeight: 600, margin: "6px 0" }}>{q.q}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>{q.options.map((op, oi) => { const chosen = pick === oi; const correct = pick !== null && oi === q.answer; const wrong = chosen && oi !== q.answer; return (<button key={oi} className="row-btn" onClick={() => setPick(oi)} style={{ borderColor: correct ? "var(--pass)" : wrong ? "var(--fail)" : "var(--border)", background: correct ? "var(--passbg)" : wrong ? "var(--failbg)" : "#fff" }}><span className="ink" style={{ flex: 1, fontSize: ".82rem" }}>{op}</span>{correct && <Check size={13} className="c-pass" />}{wrong && <X size={13} className="c-fail" />}</button>); })}</div>
    {pick !== null && q.explain && <div className="note" style={{ marginTop: 6 }}>{q.explain}</div>}
  </div>);
}
function Results({ db, commit, session, setView, flash }) {
  const me = db.users.find((u) => u.id === session.id) || session; const complete = allPassed(db, me);
  const submitted = !!(me.testimonial && me.photoKey);
  const [text, setText] = useState(me.testimonial || ""); const [photo, setPhoto] = useState(null); const [saving, setSaving] = useState(false);
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); const svg = certSVG(me, dateStr);
  const onPhoto = (e) => { const f = e.target.files?.[0]; if (!f) return; if (!f.type.startsWith("image/")) return flash("Image files only"); if (f.size > 3 * 1024 * 1024) return flash("Photo too large (max 3 MB)"); const r = new FileReader(); r.onload = () => setPhoto({ name: f.name, dataUrl: r.result }); r.readAsDataURL(f); };
  const submitGrad = async () => {
    if (!text.trim()) return flash("Please write a short testimonial");
    if (!photo && !me.photoKey) return flash("Please upload your photo");
    setSaving(true); let photoKey = me.photoKey;
    if (photo) { photoKey = `caee:photo:${me.id}`; try { await window.storage.set(photoKey, photo.dataUrl, true); } catch (x) { setSaving(false); return flash("Could not save photo"); } }
    commit({ ...db, users: db.users.map((u) => u.id === me.id ? { ...u, testimonial: text.trim(), photoKey } : u) });
    setSaving(false); flash("Thank you! Your certificate is unlocked.");
  };
  const download = () => { const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" }); const url = URL.createObjectURL(blob); const img = new Image(); img.onload = () => { const sc = 2, c = document.createElement("canvas"); c.width = 1123 * sc; c.height = 794 * sc; const ctx = c.getContext("2d"); ctx.scale(sc, sc); ctx.drawImage(img, 0, 0, 1123, 794); URL.revokeObjectURL(url); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `CAEE-Certificate-${me.name.replace(/\s+/g, "-")}.png`; a.click(); }; img.src = url; };
  return (<div className="max-w-4xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 40 }}><div style={{ marginBottom: 24 }}><BackLink onClick={() => setView("student")} /></div><SectionTitle icon={Award} k="Results" t="Internship completion" />
    {!complete ? (<Card style={{ padding: 32, textAlign: "center" }}><AlertCircle size={30} className="c-green" style={{ margin: "0 auto 12px" }} /><p className="muted" style={{ fontSize: ".875rem" }}>Pass every coding module and all projects to unlock your certificate.</p></Card>)
    : !submitted ? (<Card style={{ padding: 28 }}><div className="fbk" style={{ borderLeftColor: "var(--pass)", background: "var(--passbg)", marginBottom: 16 }}><CheckCircle2 size={14} className="c-pass" style={{ verticalAlign: "-2px" }} /> You've completed everything! One last step unlocks your certificate.</div><h3 className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>Share your photo & testimonial</h3><p className="muted" style={{ fontSize: ".85rem", marginBottom: 16 }}>This lets us issue your certificate and may feature you on our site.</p>
      <div style={{ marginBottom: 12 }}><span className="lbl">Your photo</span><label className="upload"><Upload size={18} className="c-green" /><span className="muted" style={{ fontSize: ".875rem" }}>{photo ? photo.name : me.photoKey ? "Photo on file — upload to replace" : "Upload a clear photo of yourself (max 3 MB)"}</span><input type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} /></label></div>
      <Area label="Your testimonial" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you build and learn at CAEE?" />
      <Btn onClick={submitGrad} disabled={saving}>{saving ? "Saving…" : <><Award size={15} /> Submit & unlock certificate</>}</Btn>
    </Card>)
    : (<><Card style={{ padding: 16, overflow: "auto" }}><div style={{ minWidth: 560 }} dangerouslySetInnerHTML={{ __html: svg }} /></Card><div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}><Btn onClick={download}><Download size={15} /> Download certificate (PNG)</Btn><span className="faint mono" style={{ fontSize: 12 }}>ID: {certId(me)}</span></div></>)}
  </div>);
}

/* ================= STUDENT DETAIL (grade + discussion + AI) ================= */
function StudentDetail({ db, commit, who, student, back, canGrade, canDays }) {
  const t = student.track || "btech";
  const entries = [];
  db.questions[t].forEach((m, i) => { entries.push({ uniq: `c-${m.id}`, type: "c", id: m.id, label: `M${i + 1} · C`, title: m.title, prompt: m.c?.prompt, expected: m.c?.expected }); });
  db.projects[t].forEach((p, i) => entries.push({ uniq: `p-${p.id}`, type: "p", id: p.id, label: `P${i + 1}`, title: p.title, prompt: p.desc }));
  const [draft, setDraft] = useState({}); const [aiBusy, setAiBusy] = useState(null); const [openItem, setOpenItem] = useState(null); const [revealed, setRevealed] = useState({});
  const dl = daysLeft(student);
  const lbl = (ty) => ty === "c" ? "module C" : ty === "hw" ? "module HW" : "project";
  const grade = (type, id, status) => { const k = subKey(student.id, type, id); commit({ ...db, submissions: { ...db.submissions, [k]: { ...(db.submissions[k] || {}), status, at: TODAY() } }, audit: auditPush(db, `${status} · ${student.name} · ${lbl(type)}`, who) }); };
  const saveComment = (type, id, uniq) => { const k = subKey(student.id, type, id); const txt = draft[uniq] ?? db.submissions[k]?.comment ?? ""; commit({ ...db, submissions: { ...db.submissions, [k]: { ...(db.submissions[k] || {}), comment: txt } }, audit: auditPush(db, `Commented on ${student.name}`, who) }); };
  const adjustDays = (d) => commit({ ...db, users: db.users.map((u) => u.id === student.id ? { ...u, durationDays: Math.max(0, Number(u.durationDays || 0) + d) } : u), audit: auditPush(db, `${d > 0 ? "+" : ""}${d} day · ${student.name}`, who) });
  const aiReview = async (e, code) => { setAiBusy(e.uniq); try { const prompt = `You are a senior embedded-systems C mentor reviewing an intern's submission. Task: "${e.title}". Description: ${e.prompt}.\n\nIntern's submission:\n${code}\n\nWrite concise mentor feedback (4-7 lines, plain text, no markdown headings): correctness, code structure and readability, whether the code is too long or too short, and 1-2 specific improvements. Be direct and constructive.`; const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: aiHdrs(), body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }) }); const data = await r.json(); const txt = (data.content || []).filter((i) => i.type === "text").map((i) => i.text).join("\n").trim(); setDraft((d) => ({ ...d, [e.uniq]: txt || "No feedback returned." })); } catch (x) { setDraft((d) => ({ ...d, [e.uniq]: "AI review failed — write feedback manually." })); } setAiBusy(null); };
  return (<div>
    <div style={{ marginBottom: 16 }}><BackLink onClick={back} /></div>
    <Card style={{ padding: 16, marginBottom: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}><div><div className="disp head" style={{ fontSize: "1.1rem", fontWeight: 700 }}>{student.name}</div><div className="muted" style={{ fontSize: 12 }}>{student.email} · {student.phone || "—"} · {TRACK[t].tag} · {student.college || "—"}</div></div><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ textAlign: "center" }}><div className={`disp ${dl != null && dl <= 7 ? "c-fail" : "c-green"}`} style={{ fontSize: "1.3rem", fontWeight: 700 }}>{dl == null ? "—" : dl < 0 ? "ended" : dl}</div><div className="faint" style={{ fontSize: 10, textTransform: "uppercase" }}>days left</div></div>{canDays && (<div style={{ display: "flex", gap: 6 }}><button className="iconbtn" onClick={() => adjustDays(-1)} title="-1 day"><Minus size={15} /></button><button className="iconbtn" onClick={() => adjustDays(1)} title="+1 day"><Plus size={15} /></button></div>)}</div></Card>
    <p className="faint" style={{ fontSize: 11, marginBottom: 10 }}>C parts: the student writes and runs the program on the CAEE C-practice site, then submits the final code here — it marks the module complete and lands in this queue for your review (use Pass/Fail to override). Hardware parts are optional, security-scanned before they reach you, and never block completion.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{entries.map((e) => { const s = db.submissions[subKey(student.id, e.type, e.id)]; const isOpen = openItem === e.uniq; const cval = draft[e.uniq] ?? s?.comment ?? ""; return (<Card key={e.uniq} style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><span className={`mono ${e.type === "hw" ? "c-teal" : "faint"}`} style={{ fontSize: 11, width: 70 }}>{e.label}</span><button onClick={() => setOpenItem(isOpen ? null : e.uniq)} className="ink" style={{ flex: 1, minWidth: 140, textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}>{e.title} {s?.note && <FileText size={13} className="c-teal" />}<ChevronRight size={14} className="faint" style={{ transform: isOpen ? "rotate(90deg)" : "none" }} /></button><Badge status={s?.status || "Not started"} />{canGrade && (<div style={{ display: "flex", gap: 8 }}><Btn kind="good" sm onClick={() => grade(e.type, e.id, "Passed")}><Check size={13} /> Pass</Btn><Btn kind="danger" sm onClick={() => grade(e.type, e.id, "Failed")}><X size={13} /> Fail</Btn></div>)}</div>
      {isOpen && (<div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{e.prompt}</p>
        {e.type === "c" && e.expected && (<div style={{ marginBottom: 10 }}><div className="lbl">Expected output (reference)</div><div className="code" style={{ maxHeight: 120 }}>{e.expected}</div></div>)}
        {e.type === "hw" && s?.security && (<div className="fbk" style={{ marginBottom: 10, borderLeftColor: s.security.clean ? "var(--pass)" : "var(--fail)", background: s.security.clean ? "var(--passbg)" : "var(--failbg)" }}><div className="disp" style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: s.security.clean ? "var(--pass)" : "var(--fail)" }}>{s.security.clean ? <><ShieldCheck size={15} /> Security scan: clean</> : <><ShieldAlert size={15} /> Security scan: FLAGGED — do not flash without review</>}</div><div className="ink" style={{ fontSize: ".8rem", marginTop: 4 }}>Risk: <b>{s.security.risk}</b>{s.security.summary ? ` · ${s.security.summary}` : ""}</div>{s.security.findings?.length > 0 && <ul style={{ margin: "8px 0 0 18px", fontSize: ".78rem" }}>{s.security.findings.map((f, i) => <li key={i} className="ink">{f}</li>)}</ul>}</div>)}
        {e.type === "hw" && s?.note ? null : null}
        {s?.note ? ((e.type === "hw" && s.security && !s.security.clean && !revealed[e.uniq]) ? (<div className="note" style={{ marginBottom: 10, background: "var(--failbg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}><span className="ink" style={{ fontSize: ".8rem" }}><Lock size={12} style={{ verticalAlign: "-2px" }} /> Code hidden — flagged by the security scan. Do not flash to your PC.</span><Btn kind="danger" sm onClick={() => setRevealed({ ...revealed, [e.uniq]: true })}><Eye size={12} /> Reveal anyway</Btn></div>) : (<div style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span className="lbl" style={{ marginBottom: 0 }}>{e.type === "c" ? "Submitted code" : e.type === "hw" ? "Firmware source" : "Submission"}</span><div style={{ display: "flex", gap: 6 }}><Btn kind="ghost" sm onClick={() => navigator.clipboard?.writeText(s.note)}><Copy size={12} /> Copy</Btn>{e.type === "hw" && s.security?.clean && <Btn kind="ghost" sm onClick={() => { const b = new Blob([s.note], { type: "text/x-c" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `${student.name.replace(/\s+/g, "-")}-${e.label.replace(/\W+/g, "")}.c`; a.click(); URL.revokeObjectURL(u); }}><Download size={12} /> .c</Btn>}</div></div><div className="code">{s.note}</div></div>)) : (<div className="note" style={{ marginBottom: 10 }}>No submission yet.</div>)}
        <div className="lbl" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><MessageSquare size={12} /> Mentor comment</span>{canGrade && s?.note && <Btn kind="gold" sm disabled={aiBusy === e.uniq} onClick={() => aiReview(e, s.note)}><Sparkles size={12} /> {aiBusy === e.uniq ? "Reviewing…" : "AI review"}</Btn>}</div>
        <textarea className="ta" rows={4} value={cval} onChange={(ev) => setDraft({ ...draft, [e.uniq]: ev.target.value })} placeholder="Feedback — correctness, structure, length…" disabled={!canGrade} />{canGrade && <div style={{ marginTop: 6 }}><Btn sm onClick={() => saveComment(e.type, e.id, e.uniq)}><Save size={12} /> Save comment</Btn></div>}
      </div>)}
    </Card>); })}</div>
  </div>);
}

/* ================= DASHBOARD ================= */
const CHANGE_LABELS = { remoteLab: "STM32 Remote Lab", questions: "Modules", projects: "Projects", site: "Site & settings", users: "Students & admins", registrations: "Registrations", submissions: "Grades & submissions", projectSubs: "Project submissions", tickets: "Discussion", issues: "Code issues", workshopRegs: "Workshop registrations", workshopProgress: "Workshop progress", checkins: "Check-ins", discussions: "Discussion", resetRequests: "Password resets", videoProgress: "Video progress", labProgress: "Lab progress" };
const changedAreas = (a, b) => { if (!a || !b) return []; const ks = new Set([...Object.keys(a), ...Object.keys(b)]); const out = []; ks.forEach((k) => { if (k !== "audit" && JSON.stringify(a[k]) !== JSON.stringify(b[k])) out.push(CHANGE_LABELS[k] || k); }); return out; };
const BACKUP_INDEX = "caee:backups"; const BACKUP_MAX = 30;
const RESTORE_KEYS = ["questions", "projects", "site", "users"];
async function pushBackup(snapshot, who, note) {
  const at = Date.now(); const key = `caee:backup:${at}`;
  await window.storage.set(key, JSON.stringify(snapshot), true);
  let idx = []; try { const r = await window.storage.get(BACKUP_INDEX, true); if (r && r.value) idx = JSON.parse(r.value); } catch (e) {}
  idx = [{ key, at, who, note }, ...idx]; const drop = idx.slice(BACKUP_MAX); idx = idx.slice(0, BACKUP_MAX);
  await window.storage.set(BACKUP_INDEX, JSON.stringify(idx), true);
  for (const d of drop) { try { await window.storage.delete(d.key, true); } catch (e) {} }
}
function Dash({ db: liveDb, commit: rawCommit, session, flash, isSuper }) {
  // Every admin edit is staged as an unsaved draft first. Nothing reaches the
  // live site until "Save changes" is pressed and confirmed; Undo steps back
  // one change at a time and Discard throws the whole draft away. Each save
  // keeps a backup of the site as it was just before, listed in Version history.
  const [draft, setDraft] = useState(null); const hist = useRef([]); const baseRef = useRef(null); const lastEdit = useRef(0);
  const [confirmBox, setConfirmBox] = useState(null); const [saving, setSaving] = useState(false);
  const db = draft || liveDb;
  const commit = (d) => { const now = Date.now(); if (!baseRef.current) baseRef.current = liveDb; if (!hist.current.length || now - lastEdit.current > 800) hist.current = [...hist.current, db].slice(-100); lastEdit.current = now; setDraft(d); };
  const undo = () => { const h = hist.current; if (!h.length) return; const prev = h[h.length - 1]; hist.current = h.slice(0, -1); lastEdit.current = 0; if (!hist.current.length) { setDraft(null); baseRef.current = null; } else setDraft(prev); };
  const discard = () => { hist.current = []; baseRef.current = null; setDraft(null); setConfirmBox(null); flash("Changes discarded"); };
  const saveAll = async () => {
    if (!draft) return; setSaving(true);
    const base = baseRef.current || liveDb; const areas = changedAreas(base, draft);
    let latest = liveDb; try { const r = await window.storage.get(KEY, true); if (r && r.value) latest = JSON.parse(r.value); } catch (e) {}
    // only the parts this admin actually changed are written; anything else
    // (e.g. a student's progress saved in the meantime) is kept as it is live
    const merged = { ...latest }; new Set([...Object.keys(draft), ...Object.keys(base)]).forEach((k) => { if (JSON.stringify(draft[k]) !== JSON.stringify(base[k])) merged[k] = draft[k]; });
    merged.audit = auditPush(merged, `Saved changes: ${areas.join(", ") || "minor edits"}`, session.name);
    let backupOk = true; try { await pushBackup(latest, session.name, areas.join(", ")); } catch (e) { backupOk = false; }
    try { await window.storage.set(KEY, JSON.stringify(merged), true); } catch (e) { setSaving(false); setConfirmBox(null); return flash("Could not save — check your connection. Your changes are still here."); }
    rawCommit(merged); hist.current = []; baseRef.current = null; setDraft(null); setSaving(false); setConfirmBox(null);
    flash(backupOk ? "Saved ✓ — previous version kept in Version history" : "Saved ✓ (note: backup copy could not be stored)");
  };
  useEffect(() => { if (!draft) return; const h = (e) => { e.preventDefault(); e.returnValue = ""; return ""; }; window.addEventListener("beforeunload", h); window.__caeeUnsaved = true; return () => { window.removeEventListener("beforeunload", h); window.__caeeUnsaved = false; }; }, [!!draft]);
  const pending = draft ? Math.max(1, hist.current.length) : 0; const areasNow = draft ? changedAreas(baseRef.current || liveDb, draft) : [];
  const perms = session.permissions || {}; const can = (k) => isSuper || !!perms[k];
  const tabs = ["overview"];
  if (isSuper) tabs.push("registrations");
  if (isSuper) tabs.push("stm32lab");
  if (isSuper || can("manage_students") || can("view_progress") || can("manage_access")) tabs.push("students");
  if (isSuper || can("view_progress")) tabs.push("progress");
  if (isSuper || can("view_progress") || can("manage_students")) tabs.push("issues");
  if (isSuper || can("view_progress") || can("manage_students")) tabs.push("discussion");
  if (isSuper || can("edit_content")) tabs.push("security");
  if (isSuper || can("edit_content") || can("view_progress") || can("manage_students")) tabs.push("workshop");
  if (isSuper || can("edit_content")) tabs.push("feed");
  if (isSuper || can("view_progress")) tabs.push("approvals");
  if (isSuper || can("view_progress") || can("manage_students")) tabs.push("checkins");
  if (isSuper) tabs.push("admins");
  if (isSuper || can("edit_btech_questions") || can("edit_mtech_questions")) tabs.push("questions");
  if (isSuper || can("edit_btech_questions") || can("edit_mtech_questions")) tabs.push("interview");
  if (isSuper || can("edit_btech_projects") || can("edit_mtech_projects")) tabs.push("projects");
  if (isSuper) tabs.push("activity");
  if (isSuper) tabs.push("history");
  if (isSuper || can("edit_content") || can("edit_pricing") || can("edit_registration") || can("manage_students")) tabs.push("settings");
  const [tab, setTab] = useState("overview"); const [sel, setSel] = useState(null);
  const labels = { stm32lab: "STM32 Lab Settings", history: "Version history", overview: "Overview", registrations: "Registrations", students: "Students", progress: "Progress", issues: "Code issues", admins: "Admins", questions: "Questions", interview: "Interview MCQ", projects: "Projects", activity: "Activity", security: "Lab security", workshop: "Workshop", discussion: "Discussion", feed: "Projects feed", approvals: "Project approvals", checkins: "Check-ins", settings: "Settings" };
  const icons = { stm32lab: Cpu, history: HistoryIcon, overview: LayoutDashboard, registrations: UserPlus, students: Users, progress: TrendingUp, issues: AlertCircle, admins: ShieldCheck, questions: FileCode, interview: HelpCircle, projects: FolderKanban, activity: Activity, security: Shield, workshop: GraduationCap, discussion: MessageSquare, feed: Sparkles, approvals: CheckCircle2, checkins: AlertTriangle, settings: Cog };
  const student = sel ? db.users.find((u) => u.id === sel) : null;
  return (<div className="max-w-5xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 40 }}>
    <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, marginBottom: 4 }}>{isSuper ? <ShieldCheck size={13} /> : <Eye size={13} />} {isSuper ? "SUPER-ADMIN" : "ADMIN"}</div>
    <h1 className="disp head" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: isSuper ? 24 : 4 }}>{isSuper ? "Control room" : session.name}</h1>
    {!isSuper && <p className="faint" style={{ fontSize: 12, marginBottom: 24 }}>You see only what the super-admin has granted.</p>}
    <div className="tabbar">{tabs.map((t) => { const Ic = icons[t]; return <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setSel(null); }}><Ic size={14} /> {labels[t]}</button>; })}</div>
    {tab === "overview" && <Overview db={db} />}
    {tab === "registrations" && <Registrations db={db} commit={commit} flash={flash} who={session.name} />}
    {tab === "stm32lab" && isSuper && <RemoteLabAdmin db={db} commit={commit} flash={flash} who={session.name} />}
    {tab === "students" && (student ? <StudentDetail db={db} commit={commit} who={session.name} student={student} back={() => setSel(null)} canGrade={can("view_progress")} canDays={can("manage_students")} /> : <Students db={db} commit={commit} flash={flash} who={session.name} onSelect={setSel} canManage={can("manage_students")} canAccess={can("manage_access")} />)}
    {tab === "progress" && (student ? <StudentDetail db={db} commit={commit} who={session.name} student={student} back={() => setSel(null)} canGrade={can("view_progress")} canDays={can("manage_students")} /> : <ProgressBoard db={db} onSelect={setSel} />)}
    {tab === "issues" && <IssuesBoard db={db} commit={commit} who={session.name} />}
    {tab === "discussion" && <TicketAdmin db={db} commit={commit} flash={flash} />}
    {tab === "feed" && <ProjectsFeedAdmin db={db} commit={commit} flash={flash} />}
    {tab === "approvals" && <ProjectApprovals db={db} commit={commit} flash={flash} who={session.name} />}
    {tab === "checkins" && <CheckinsPanel db={db} commit={commit} flash={flash} who={session.name} />}
    {tab === "security" && <SecurityEditor db={db} commit={commit} flash={flash} />}
    {tab === "workshop" && <WorkshopAdmin db={db} commit={commit} flash={flash} />}
    {tab === "admins" && <Admins db={db} commit={commit} flash={flash} who={session.name} />}
    {tab === "questions" && <QuestionEditor db={db} commit={commit} flash={flash} allow={{ btech: can("edit_btech_questions"), mtech: can("edit_mtech_questions") }} />}
    {tab === "interview" && <McqEditor db={db} commit={commit} flash={flash} allow={{ btech: can("edit_btech_questions"), mtech: can("edit_mtech_questions") }} />}
    {tab === "projects" && <ProjectEditor db={db} commit={commit} flash={flash} allow={{ btech: can("edit_btech_projects"), mtech: can("edit_mtech_projects") }} />}
    {tab === "activity" && <ActivityLog db={db} />}
    {tab === "settings" && <SettingsTab db={db} commit={commit} flash={flash} who={session.name} can={can} />}
    {tab === "history" && <VersionHistory db={db} commit={commit} flash={flash} />}
    {draft && <div style={{ height: 90 }} />}
    {draft && (<div style={{ position: "fixed", left: 12, right: 12, bottom: 14, zIndex: 80, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div className="card" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "12px 16px", borderRadius: 14, background: "var(--bg2)", border: "1px solid rgba(214,158,46,.55)", boxShadow: "0 10px 30px rgba(0,0,0,.18)", maxWidth: 760, width: "100%" }}>
        <AlertTriangle size={18} className="c-gold" style={{ flex: "none" }} />
        <div style={{ flex: 1, minWidth: 160 }}><div className="ink" style={{ fontWeight: 700, fontSize: ".9rem" }}>Unsaved changes ({pending})</div><div className="faint" style={{ fontSize: 11 }}>{areasNow.length ? `Changed: ${areasNow.join(", ")}` : "Not live yet"} — press Save to make them live.</div></div>
        <Btn kind="ghost" sm onClick={undo}><Undo2 size={14} /> Undo</Btn>
        <Btn kind="ghost" sm onClick={() => setConfirmBox("discard")}><X size={14} /> Discard</Btn>
        <Btn sm onClick={() => setConfirmBox("save")}><Save size={14} /> Save changes</Btn>
      </div></div>)}
    {confirmBox && (<div style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(8,20,18,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => !saving && setConfirmBox(null)}>
      <div className="card" style={{ maxWidth: 440, width: "100%", padding: 22, borderRadius: 16, background: "var(--bg2)" }} onClick={(e) => e.stopPropagation()}>
        {confirmBox === "save" ? (<>
          <div className="disp head" style={{ fontWeight: 700, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Save size={18} className="c-green" /> Save changes to the live website?</div>
          <p className="muted" style={{ fontSize: ".85rem", marginBottom: 6 }}>{areasNow.length ? <>This updates: <b>{areasNow.join(", ")}</b>.</> : "Your edits will go live."}</p>
          <p className="faint" style={{ fontSize: 12, marginBottom: 16 }}>A copy of the site as it is right now is kept in Version history, so you can go back if needed.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Btn kind="ghost" onClick={() => setConfirmBox(null)} disabled={saving}>Cancel</Btn><Btn onClick={saveAll} disabled={saving}><Check size={15} /> {saving ? "Saving…" : "Yes, save"}</Btn></div>
        </>) : (<>
          <div className="disp head" style={{ fontWeight: 700, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><AlertTriangle size={18} className="c-gold" /> Discard all unsaved changes?</div>
          <p className="muted" style={{ fontSize: ".85rem", marginBottom: 16 }}>Everything you changed since the last save will be thrown away. The live website stays exactly as it is.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Btn kind="ghost" onClick={() => setConfirmBox(null)}>Keep editing</Btn><Btn kind="ghost" onClick={discard}><X size={15} /> Discard</Btn></div>
        </>)}
      </div></div>)}
  </div>);
}
function VersionHistory({ db, commit, flash }) {
  const [list, setList] = useState(null); const [busy, setBusy] = useState(null);
  useEffect(() => { (async () => { try { const r = await window.storage.get(BACKUP_INDEX, true); setList(r && r.value ? JSON.parse(r.value) : []); } catch (e) { setList([]); } })(); }, []);
  const load = async (b) => {
    setBusy(b.key);
    try { const r = await window.storage.get(b.key, true); if (!r || !r.value) { setBusy(null); return flash("That backup could not be found"); }
      const snap = JSON.parse(r.value); const next = { ...db }; RESTORE_KEYS.forEach((k) => { if (snap[k] !== undefined) next[k] = snap[k]; });
      commit(next); flash("Older version loaded — check it, then press Save changes to make it live");
    } catch (e) { flash("Could not load that backup"); }
    setBusy(null);
  };
  return (<div>
    <Card style={{ padding: 18, marginBottom: 16 }}><div className="ink" style={{ fontSize: ".875rem", fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><HistoryIcon size={15} className="c-green" /> Version history</div><p className="muted" style={{ fontSize: 12 }}>Every time you press Save, a copy of the website as it was just before is kept here (last {BACKUP_MAX}). "Go back to this version" brings back the modules, projects, site settings and student/admin list from that moment — student progress and grades are never touched. It is loaded as an unsaved change first, so nothing goes live until you press Save.</p></Card>
    {list === null ? <div className="muted" style={{ fontSize: 13 }}>Loading…</div> : list.length === 0 ? <Empty msg="No saved versions yet — one is created every time you press Save." /> : (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{list.map((b) => (<Card key={b.key} style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Clock size={16} className="c-teal" style={{ flex: "none" }} />
        <div style={{ flex: 1, minWidth: 180 }}><div className="ink" style={{ fontSize: ".85rem", fontWeight: 600 }}>Before save on {new Date(b.at).toLocaleString()}</div><div className="faint" style={{ fontSize: 11 }}>{b.who ? `Saved by ${b.who}` : ""}{b.note ? ` · changed: ${b.note}` : ""}</div></div>
        <Btn kind="ghost" sm disabled={busy === b.key} onClick={() => load(b)}><RotateCcw size={13} /> {busy === b.key ? "Loading…" : "Go back to this version"}</Btn>
      </Card>))}</div>)}
  </div>);
}
function Overview({ db }) {
  const students = db.users.filter((u) => u.role === "student"); const active = students.filter((u) => u.access).length; const completed = students.filter((u) => allPassed(db, u)).length; const pending = db.registrations.filter((r) => r.status === "pending").length;
  const tiles = [[Users, "Students", students.length], [BadgeCheck, "Active (access on)", active], [Award, "Completed", completed], [UserPlus, "Pending registrations", pending]];
  return (<div><div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 24 }}>{tiles.map(([Ic, l, v], i) => (<div className="tile" key={i}><Ic size={18} className="c-green" /><div className="disp head" style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 6 }}>{v}</div><div className="muted" style={{ fontSize: 12 }}>{l}</div></div>))}</div><div className="lbl">Recent activity</div>{(db.audit || []).length === 0 ? <Empty msg="No activity yet." /> : (<Card style={{ padding: 8 }}>{(db.audit || []).slice(0, 8).map((a, i) => (<div key={i} className={i < 7 ? "divider" : ""} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 10px" }}><span className="ink" style={{ fontSize: ".8rem" }}>{a.msg}</span><span className="faint mono" style={{ fontSize: 11, whiteSpace: "nowrap" }}>{new Date(a.at).toLocaleDateString()} · {a.who}</span></div>))}</Card>)}</div>);
}
function ProgressBoard({ db, onSelect }) {
  const students = db.users.filter((u) => u.role === "student");
  if (!students.length) return <Empty msg="No students enrolled yet." />;
  const rows = students.map((u) => {
    const t = u.track || "btech"; const items = [...db.questions[t].map((m) => ["c", m.id]), ...db.projects[t].map((p) => ["p", p.id])];
    const passed = items.filter(([ty, id]) => db.submissions[subKey(u.id, ty, id)]?.status === "Passed");
    const actual = passed.length / items.length; const ed = elapsedDays(u); const dur = Number(u.durationDays || 0);
    const expected = dur > 0 && ed != null ? Math.min(1, ed / dur) : 0; const diff = actual - expected;
    const status = diff >= 0.08 ? "Ahead" : diff <= -0.08 ? "Behind" : "On track";
    const cutoff = Date.now() - 7 * 86400000;
    const thisWeek = items.filter(([ty, id]) => { const s = db.submissions[subKey(u.id, ty, id)]; return s?.status === "Passed" && s.at && new Date(s.at).getTime() >= cutoff; }).length;
    const week = ed != null ? Math.max(1, Math.ceil((ed + 1) / 7)) : "—";
    return { u, total: items.length, passedN: passed.length, actual, expected, diff, status, thisWeek, week };
  }).sort((a, b) => a.diff - b.diff);
  return (<div>
    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}><Badge status="Behind" /> <span className="muted" style={{ fontSize: 12 }}>behind expected pace</span><span style={{ width: 10 }} /><Badge status="On track" /> <Badge status="Ahead" /></div>
    <Card style={{ padding: 0, overflow: "hidden" }}><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Student</th><th>Track</th><th>Week</th><th>Passed</th><th>Pace (actual vs expected)</th><th>This week</th><th>Status</th></tr></thead><tbody>{rows.map((r) => (<tr key={r.u.id}>
      <td><button onClick={() => onSelect(r.u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--head)", fontWeight: 600, fontSize: ".82rem" }}>{r.u.name}</button></td>
      <td><span className="pill pill-green">{(TRACK[r.u.track] || TRACK.btech).tag}</span></td>
      <td className="muted">W{r.week}</td>
      <td className="mono">{r.passedN}/{r.total}</td>
      <td style={{ minWidth: 160 }}><div style={{ position: "relative", height: 8, background: "var(--tint)", borderRadius: 999, overflow: "hidden" }}><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.actual * 100}%`, background: "var(--green)" }} /><div style={{ position: "absolute", left: `${r.expected * 100}%`, top: -2, bottom: -2, width: 2, background: "var(--gold-d)" }} /></div><div className="faint" style={{ fontSize: 10, marginTop: 3 }}>{Math.round(r.actual * 100)}% done · {Math.round(r.expected * 100)}% expected</div></td>
      <td className="mono c-green" style={{ fontWeight: 700 }}>+{r.thisWeek}</td>
      <td><Badge status={r.status} /></td>
    </tr>))}</tbody></table></div></Card>
    <p className="faint" style={{ fontSize: 11, marginTop: 10 }}>The gold marker is the expected pace based on days elapsed since join vs course duration. Behind = falling short of pace; tap a name to grade or message.</p>
  </div>);
}
function ActivityLog({ db }) { const a = db.audit || []; if (!a.length) return <Empty msg="No activity logged yet." />; return (<Card style={{ padding: 8 }}>{a.map((x, i) => (<div key={i} className={i < a.length - 1 ? "divider" : ""} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 10px" }}><span className="ink" style={{ fontSize: ".82rem" }}>{x.msg}</span><span className="faint mono" style={{ fontSize: 11, whiteSpace: "nowrap" }}>{new Date(x.at).toLocaleString()} · {x.who}</span></div>))}</Card>); }
function IssuesBoard({ db, commit, who }) {
  const issues = db.issues || []; const [filter, setFilter] = useState("open"); const [reply, setReply] = useState({});
  const list = issues.filter((i) => filter === "all" || i.status === filter);
  const setStatus = (id, status) => commit({ ...db, issues: issues.map((i) => i.id === id ? { ...i, status } : i), audit: auditPush(db, `Issue ${status}`, who) });
  const saveReply = (id) => commit({ ...db, issues: issues.map((i) => i.id === id ? { ...i, reply: reply[id] ?? i.reply ?? "" } : i) });
  const tname = (t) => t === "c" ? "C task" : t === "hw" ? "Hardware" : t === "p" ? "Project" : t;
  if (!issues.length) return <Empty msg="No code issues reported yet." />;
  const openN = issues.filter((i) => i.status === "open").length;
  return (<div>
    <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>{["open", "resolved", "all"].map((f) => <button key={f} className={`toggle ${filter === f ? "on" : ""}`} style={{ textTransform: "capitalize" }} onClick={() => setFilter(f)}>{f}{f === "open" ? ` · ${openN}` : ""}</button>)}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{list.map((it) => (<Card key={it.id} style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="disp head" style={{ fontWeight: 600, fontSize: ".95rem" }}>{it.name}</span><Badge status={it.status === "open" ? "pending" : "approved"} /></div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{(TRACK[it.track] || TRACK.btech).tag} · {tname(it.type)} · {it.moduleTitle}</div></div>
        <div className="faint mono" style={{ fontSize: 11 }}>{new Date(it.at).toLocaleString()}</div>
      </div>
      <p className="ink" style={{ fontSize: ".85rem", marginTop: 10, whiteSpace: "pre-wrap" }}>{it.text}</p>
      <div style={{ marginTop: 10 }}><input className="input" placeholder="Reply / resolution note (optional)" value={reply[it.id] ?? it.reply ?? ""} onChange={(e) => setReply({ ...reply, [it.id]: e.target.value })} /></div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}><Btn sm kind="ghost" onClick={() => saveReply(it.id)}><Save size={12} /> Save note</Btn>{it.status === "open" ? <Btn sm kind="good" onClick={() => setStatus(it.id, "resolved")}><Check size={12} /> Mark resolved</Btn> : <Btn sm kind="ghost" onClick={() => setStatus(it.id, "open")}>Reopen</Btn>}</div>
    </Card>))}</div>
  </div>);
}

/* ---- registrations ---- */
function Registrations({ db, commit, flash, who }) {
  const [pick, setPick] = useState({}); const [qy, setQy] = useState("");
  const list = db.registrations.filter((r) => (r.name + r.email + (r.college || "")).toLowerCase().includes(qy.toLowerCase()));
  const dl = async (r) => { if (!r.resumeKey) return flash("No resume"); try { const res = await window.storage.get(r.resumeKey, true); if (!res?.value) return flash("Resume not found"); const a = document.createElement("a"); a.href = res.value; a.download = r.resumeName || "resume"; a.click(); } catch (e) { flash("Could not load resume"); } };
  const approve = (r) => { const track = pick[r.id] || r.track; if (db.users.some((u) => u.email.toLowerCase() === r.email.toLowerCase())) return flash("A user with this email already exists"); const pw = "caee" + Math.floor(1000 + Math.random() * 9000); commit({ ...db, users: [...db.users, { id: uid(), role: "student", name: r.name, email: r.email, password: pw, phone: r.phone, college: r.college, year: r.year, marks: r.marks, track, access: false, durationDays: db.site.courseDefaults[track], startDate: TODAY() }], registrations: db.registrations.map((x) => x.id === r.id ? { ...x, status: "approved", track } : x), audit: auditPush(db, `Enrolled ${r.name} (${TRACK[track].tag}) — access OFF`, who) }); flash(`${r.name} enrolled · temp pw ${pw} · grant access after payment`); };
  const reject = (r) => commit({ ...db, registrations: db.registrations.map((x) => x.id === r.id ? { ...x, status: "rejected" } : x), audit: auditPush(db, `Rejected ${r.name}`, who) });
  if (!db.registrations.length) return <Empty msg="No registrations yet." />;
  return (<div><div style={{ position: "relative", marginBottom: 16, maxWidth: 320 }}><Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} /><input className="input has-ic" placeholder="Search name, email, college" value={qy} onChange={(e) => setQy(e.target.value)} /></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{list.map((r) => { const sel = pick[r.id] || r.track; return (<Card key={r.id} style={{ padding: 20 }}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div style={{ flex: 1, minWidth: 220 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span className="disp head" style={{ fontSize: "1rem", fontWeight: 600 }}>{r.name}</span><Badge status={r.status} /></div><div className="grid sm:grid-cols-2" style={{ gap: "4px 24px", marginTop: 8 }}><span className="muted" style={{ fontSize: 12, display: "flex", gap: 6 }}><Mail size={12} className="faint" /> {r.email}</span><span className="muted" style={{ fontSize: 12, display: "flex", gap: 6 }}><Phone size={12} className="faint" /> {r.phone}</span><span className="muted" style={{ fontSize: 12, display: "flex", gap: 6 }}><Building2 size={12} className="faint" /> {r.college || "—"}</span><span className="muted" style={{ fontSize: 12, display: "flex", gap: 6 }}><CalendarDays size={12} className="faint" /> {r.year}{r.marks ? ` · ${r.marks}` : ""} · pref {TRACK[r.track].tag}</span></div>{r.why && <p className="note" style={{ marginTop: 12, fontStyle: "italic" }}>"{r.why}"</p>}</div><div style={{ textAlign: "right" }}><div className="faint mono" style={{ fontSize: 10, marginBottom: 8 }}>{r.at}</div>{r.resumeName ? <Btn kind="ghost" onClick={() => dl(r)}><FileText size={14} /> Resume</Btn> : <span className="faint" style={{ fontSize: 11 }}>no resume</span>}</div></div>
      {r.status === "pending" && (<div className="divider-t" style={{ marginTop: 16, paddingTop: 16 }}><div className="lbl" style={{ marginBottom: 8 }}>Allow into track</div><div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}><div style={{ display: "flex", gap: 8 }}>{["btech", "mtech"].map((t) => (<button key={t} className={`toggle ${sel === t ? "on" : ""}`} onClick={() => setPick({ ...pick, [r.id]: t })}><span className={`tickbox ${sel === t ? "on" : ""}`}>{sel === t && <Check size={11} color="#fff" />}</span>{TRACK[t].tag}</button>))}</div><Btn kind="good" onClick={() => approve(r)}><Check size={14} /> Approve & enrol</Btn><Btn kind="danger" onClick={() => reject(r)}><X size={14} /> Reject</Btn></div></div>)}
    </Card>); })}</div></div>);
}

/* ---- students table ---- */
function Students({ db, commit, flash, who, onSelect, canManage, canAccess }) {
  const all = db.users.filter((u) => u.role === "student"); const [qy, setQy] = useState(""); const [filter, setFilter] = useState("all"); const [showAdd, setShowAdd] = useState(false); const [issuedOtp, setIssuedOtp] = useState(null);
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "", college: "", year: "3rd year", track: "btech" }); const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const students = all.filter((u) => (filter === "all" || u.track === filter) && (u.name + u.email + (u.college || "")).toLowerCase().includes(qy.toLowerCase()));
  const add = () => { if (!f.name || !f.email) return flash("Name and email are required"); if (db.users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) return flash("Email exists"); const otp = genOtp(); commit({ ...db, users: [...db.users, { id: uid(), role: "student", access: false, durationDays: db.site.courseDefaults[f.track], startDate: TODAY(), ...f, password: otp, mustSetPassword: true }], audit: auditPush(db, `Added student ${f.name}`, who) }); setIssuedOtp({ name: f.name, email: f.email, otp }); setF({ name: "", email: "", password: "", phone: "", college: "", year: "3rd year", track: "btech" }); setShowAdd(false); flash("Student added — one-time password generated"); };
  const toggleAccess = (u) => commit({ ...db, users: db.users.map((x) => x.id === u.id ? { ...x, access: !x.access } : x), audit: auditPush(db, `${u.access ? "Revoked" : "Granted"} access · ${u.name}`, who) });
  const del = (u) => commit({ ...db, users: db.users.filter((x) => x.id !== u.id), audit: auditPush(db, `Removed ${u.name}`, who) });
  const resetPw = (u) => { const otp = genOtp(); commit({ ...db, users: db.users.map((x) => x.id === u.id ? { ...x, password: otp, mustSetPassword: true } : x), audit: auditPush(db, `Issued one-time password · ${u.name}`, who) }); setIssuedOtp({ name: u.name, email: u.email, otp }); flash("One-time password issued"); };
  const adjust = (u, d) => commit({ ...db, users: db.users.map((x) => x.id === u.id ? { ...x, durationDays: Math.max(0, Number(x.durationDays || 0) + d) } : x), audit: auditPush(db, `${d > 0 ? "+" : ""}${d} day · ${u.name}`, who) });
  const csv = () => exportCSV(["Name", "Phone", "Email", "Year", "College", "Track", "Access", "Days left"], students.map((u) => [u.name, u.phone || "", u.email, u.year || "", u.college || "", (TRACK[u.track] || TRACK.btech).tag, u.access ? "yes" : "no", daysLeft(u) ?? ""]), "caee-students.csv");
  const resetReqs = db.resetRequests || [];
  const issueForReset = (rq) => { const u = db.users.find((x) => x.email.toLowerCase() === rq.email); if (!u) { commit({ ...db, resetRequests: resetReqs.filter((r) => r.id !== rq.id) }); return; } const otp = genOtp(); commit({ ...db, users: db.users.map((x) => x.id === u.id ? { ...x, password: otp, mustSetPassword: true } : x), resetRequests: resetReqs.filter((r) => r.id !== rq.id), audit: auditPush(db, `Issued reset one-time password · ${u.name}`, who) }); setIssuedOtp({ name: u.name, email: u.email, otp }); };
  return (<div>
    {resetReqs.length > 0 && (<Card style={{ padding: 14, marginBottom: 16, borderColor: "var(--gold)", background: "rgba(232,184,75,.07)" }}><div className="disp head" style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 8 }}><KeyRound size={14} style={{ verticalAlign: "-2px" }} /> Password reset requests ({resetReqs.length})</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{resetReqs.map((r) => (<div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><span className="ink" style={{ fontWeight: 600, fontSize: ".84rem" }}>{r.name}</span><span className="muted" style={{ fontSize: 12 }}>{r.email}</span><span className="faint" style={{ fontSize: 11 }}>{r.at}</span><span style={{ flex: 1 }} /><Btn sm onClick={() => issueForReset(r)}><KeyRound size={13} /> Issue one-time password</Btn></div>))}</div></Card>)}
    {issuedOtp && (<Card style={{ padding: 16, marginBottom: 16, background: "rgba(43,166,101,.08)", borderColor: "var(--green)" }}><div style={{ display: "flex", alignItems: "flex-start", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}><div><div className="disp head" style={{ fontWeight: 700, fontSize: ".9rem" }}>One-time password for {issuedOtp.name}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Send this to <b className="ink">{issuedOtp.email}</b>. They enter it on the Activate screen to set their own password.</div><div className="mono" style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: 4, color: "var(--green-d)", marginTop: 8 }}>{issuedOtp.otp}</div></div><div style={{ display: "flex", gap: 8 }}><Btn sm kind="ghost" onClick={() => { try { navigator.clipboard.writeText(issuedOtp.otp); flash("Copied"); } catch (e) {} }}><Copy size={13} /> Copy</Btn><button className="iconbtn" onClick={() => setIssuedOtp(null)}><X size={14} /></button></div></div><div className="faint" style={{ fontSize: 11, marginTop: 8 }}>This prototype cannot send the email itself - copy the code and send it. In the production build it is emailed to their purchase email automatically.</div></Card>)}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 16 }}><div style={{ position: "relative", flex: 1, minWidth: 200 }}><Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} /><input className="input has-ic" placeholder="Search name, email, college" value={qy} onChange={(e) => setQy(e.target.value)} /></div><select className="sel" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All tracks</option><option value="btech">B.Tech</option><option value="mtech">M.Tech</option></select><Btn kind="ghost" onClick={csv}><Download size={14} /> CSV</Btn>{canManage && <Btn onClick={() => setShowAdd(!showAdd)}><UserPlus size={15} /> Add</Btn>}</div>
    {showAdd && canManage && (<Card style={{ padding: 18, marginBottom: 16 }}><div className="grid sm:grid-cols-3 gap-3"><Field label="Name" value={f.name} onChange={set("name")} /><Field label="Gmail (their purchase email)" value={f.email} onChange={set("email")} /><Field label="Phone" value={f.phone} onChange={set("phone")} /><Field label="College" value={f.college} onChange={set("college")} /><label style={{ display: "block", marginBottom: 12 }}><span className="lbl">Track</span><select className="sel" value={f.track} onChange={set("track")}><option value="btech">B.Tech</option><option value="mtech">M.Tech</option></select></label></div><p className="faint" style={{ fontSize: 11, marginBottom: 8 }}>A one-time password is generated automatically when you add the student - you will see it here to send to their email.</p><Btn onClick={add}><Plus size={15} /> Add student</Btn></Card>)}
    {students.length === 0 ? <Empty msg="No students match." /> : (<Card style={{ padding: 0, overflow: "hidden" }}><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Name</th><th>Phone</th><th>Gmail</th><th>Year</th><th>College</th><th>Track</th><th>Access</th><th>Days</th><th></th></tr></thead><tbody>{students.map((u) => { const dlv = daysLeft(u); const done = allPassed(db, u); return (<tr key={u.id}><td><button onClick={() => onSelect(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--head)", fontWeight: 600, fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6 }}>{u.name}{done && <Award size={13} className="c-pass" />}</button></td><td className="muted">{u.phone || "—"}</td><td className="muted">{u.email}</td><td className="muted">{u.year || "—"}</td><td className="muted">{u.college || "—"}</td><td><span className="pill pill-green">{(TRACK[u.track] || TRACK.btech).tag}</span></td><td>{canAccess ? <button className={u.access ? "access-on" : "access-off"} onClick={() => toggleAccess(u)}>{u.access ? <><Check size={11} /> Allowed</> : <><Lock size={11} /> Locked</>}</button> : <span className={u.access ? "c-pass" : "muted"} style={{ fontSize: 11, fontWeight: 700 }}>{u.access ? "Allowed" : "Locked"}</span>}</td><td><div style={{ display: "flex", alignItems: "center", gap: 4 }}><button className="iconbtn" style={{ width: 24, height: 24 }} onClick={() => adjust(u, -1)} title="-1 day"><Minus size={12} /></button><span className="mono" style={{ minWidth: 26, textAlign: "center", fontSize: 12 }}>{dlv == null ? "—" : dlv}</span><button className="iconbtn" style={{ width: 24, height: 24 }} onClick={() => adjust(u, 1)} title="+1 day"><Plus size={12} /></button></div></td><td><div style={{ display: "flex", gap: 4 }}>{canManage && <button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => resetPw(u)} title="Issue one-time password"><KeyRound size={13} /></button>}{canManage && <button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => del(u)} title="Remove"><Trash2 size={13} /></button>}</div></td></tr>); })}</tbody></table></div></Card>)}
    <p className="faint" style={{ fontSize: 11, marginTop: 10 }}>Access stays <b>Locked</b> until you confirm payment in Tagmango, then toggle <b>Allowed</b> to unlock their course. Tap a name to grade, comment and review code.</p>
  </div>);
}

/* ---- admins (name | permissions tickboxes) ---- */
function Admins({ db, commit, flash, who }) {
  const admins = db.users.filter((u) => u.role === "admin"); const [f, setF] = useState({ name: "", email: "", password: "" }); const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = () => { if (!f.name || !f.email || !f.password) return flash("All fields required"); if (db.users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) return flash("Email exists"); commit({ ...db, users: [...db.users, { id: uid(), role: "admin", ...f, permissions: {} }], audit: auditPush(db, `Created admin ${f.name}`, who) }); setF({ name: "", email: "", password: "" }); flash("Admin added — grant access below"); };
  const toggle = (id, key) => commit({ ...db, users: db.users.map((u) => u.id === id ? { ...u, permissions: { ...u.permissions, [key]: !u.permissions?.[key] } } : u) });
  const del = (id) => commit({ ...db, users: db.users.filter((u) => u.id !== id) });
  return (<div><Card style={{ padding: 20, marginBottom: 24 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".875rem", marginBottom: 16 }}><UserPlus size={16} className="c-green" /> Add admin (mentor)</div><div className="grid sm:grid-cols-3 gap-3"><Field label="Name" value={f.name} onChange={set("name")} /><Field label="Email" value={f.email} onChange={set("email")} /><Field label="Password" value={f.password} onChange={set("password")} /></div><Btn onClick={add}><Plus size={15} /> Create admin</Btn></Card>
    {admins.length === 0 ? <Empty msg="No admins yet." /> : (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{admins.map((u) => (<Card key={u.id} style={{ padding: 20 }}><div className="grid md:grid-cols-3 gap-4"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div><div className="head" style={{ fontSize: ".95rem", fontWeight: 700 }}>{u.name}</div><div className="faint" style={{ fontSize: 12 }}>{u.email}</div></div><button className="iconbtn" onClick={() => del(u.id)}><Trash2 size={14} /></button></div><div style={{ gridColumn: "span 2 / span 2" }}><div className="lbl" style={{ marginBottom: 8 }}>Permissions (tick to grant)</div><div className="grid sm:grid-cols-2 gap-2">{PERMS.map(([key, label]) => { const on = !!u.permissions?.[key]; return (<button key={key} className={`perm ${on ? "on" : ""}`} onClick={() => toggle(u.id, key)}><span className={`tickbox ${on ? "on" : ""}`}>{on && <Check size={11} color="#fff" />}</span> {label}</button>); })}</div></div></div></Card>))}</div>)}
  </div>);
}

/* ---- editors ---- */
const SYLLABUS_SEP2026 = {
  btech: [
    ["C1", "C1: C Values, Functions and Checked Arithmetic"],
    ["C2", "C2: Bits, Arrays, Pointers and Structures"],
    ["C3", "C3: State, Scope and Reproducible Debugging"],
    ["BF", "BF: B.Tech Foundation Bridge — Bytes and Rollover"],
    ["B1", "B1: Embedded C Kernel and ECU Architecture"],
    ["B2", "B2: CAN/CAN-FD Physical Layer and Two-Node Rig"],
    ["B3", "B3: CAN Frame, Arbitration, CRC and Fault Confinement"],
    ["B4", "B4: FDCAN Timing and CAN-FD Phases"],
    ["B5", "B5: Signal Encoding, Counters, CRC and Scheduling"],
    ["B6", "B6: Receiver Validation and Safe-State Machine"],
  ],
  mtech: [
    ["C1", "C1: C Values, Functions and Checked Arithmetic"],
    ["C2", "C2: Bits, Arrays, Pointers and Structures"],
    ["C3", "C3: State, Scope and Reproducible Debugging"],
    ["MF", "MF: M.Tech Foundation Bridge — Units and Sampled Dynamics"],
    ["M1", "M1: PMSM, Inverter and Motor-Model Foundations"],
    ["M2", "M2: Current Sensing, ADC Calibration and PWM Synchronization"],
    ["M3", "M3: Clarke and Park Transforms"],
    ["M4", "M4: Discrete PI Current Control, Limits and Anti-Windup"],
    ["M5", "M5: SVPWM and the Fast Control Loop"],
    ["M6", "M6: Sensored Startup and Nested Speed Control"],
    ["M7", "M7: PMSM Digital Twin, Protection and Verification"],
  ],
};
function QuestionEditor({ db, commit, allow, flash }) {
  const tracks = Object.entries(allow).filter(([, v]) => v).map(([k]) => k); const [track, setTrack] = useState(tracks[0]); if (!tracks.length) return <Empty msg="No question-edit permission." />;
  const list = db.questions[track]; const intro = db.site.trackIntro?.[track] || {};
  const updTitle = (id, v) => commit({ ...db, questions: { ...db.questions, [track]: list.map((m) => m.id === id ? { ...m, title: v } : m) } });
  const updPart = (id, part, field, v) => commit({ ...db, questions: { ...db.questions, [track]: list.map((m) => m.id === id ? { ...m, [part]: { ...m[part], [field]: v } } : m) } });
  const updIntro = (k, v) => commit({ ...db, site: { ...db.site, trackIntro: { ...db.site.trackIntro, [track]: { ...intro, [k]: v } } } });
  const add = () => commit({ ...db, questions: { ...db.questions, [track]: [...list, { id: uid(), title: "New module", c: { prompt: "", expected: "", resources: "" }, hw: { prompt: "", submit: "", resources: "" } }] } });
  const addFirst = () => commit({ ...db, questions: { ...db.questions, [track]: [{ id: uid(), title: "Module 0 · Introduction", c: { prompt: "Orientation videos — no coding challenge, add one or more videos below.", expected: "", resources: "" }, hw: { prompt: "", submit: "", resources: "" } }, ...list] } });
  const del = (id) => commit({ ...db, questions: { ...db.questions, [track]: list.filter((m) => m.id !== id) } });
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= list.length) return; const a = list.slice(); const t = a[i]; a[i] = a[j]; a[j] = t; commit({ ...db, questions: { ...db.questions, [track]: a } }); };
  // One-click migration to the Sep 2026 syllabus: keeps Module 0 first and
  // untouched, matches each existing module to its new title by code
  // prefix (so its id, and any PDFs/videos already uploaded to it, are
  // preserved) and inserts blank modules for the brand-new codes (the
  // Common C Fundamentals block + the Foundation Bridge module). Anything
  // that doesn't match a known code (extra modules the admin already
  // added) is kept, appended at the end — nothing is ever deleted.
  const applySyllabus = () => {
    const spec = SYLLABUS_SEP2026[track]; if (!spec) return;
    const isM0 = (m) => /^module\s*0\b/i.test((m.title || "").trim());
    const m0 = list.find(isM0);
    const used = new Set(m0 ? [m0.id] : []);
    const blank = (title) => ({ id: uid(), title, c: { prompt: "", expected: "", resources: "" }, hw: { prompt: "", submit: "", resources: "" } });
    // Clean up the old auto-filled placeholder text (from before this was
    // blank-by-default) if a module still has it untouched, so it never
    // shows up as if it were real task content on the student or public
    // side. Leaves anything the admin has actually written alone.
    const declutter = (m) => ({
      ...m,
      c: { ...m.c, prompt: m.c?.prompt === "Describe the C task…" ? "" : m.c?.prompt },
      hw: { ...m.hw, prompt: m.hw?.prompt === "Optional STM32 hardware task…" ? "" : m.hw?.prompt },
    });
    const ordered = m0 ? [m0] : [];
    for (const [code, title] of spec) {
      const existing = list.find((m) => !used.has(m.id) && new RegExp(`^${code}\\b`, "i").test((m.title || "").trim()));
      if (existing) { ordered.push(declutter({ ...existing, title })); used.add(existing.id); }
      else ordered.push(blank(title));
    }
    const leftover = list.filter((m) => !used.has(m.id)).map(declutter);
    commit({ ...db, questions: { ...db.questions, [track]: [...ordered, ...leftover] } });
    flash && flash(`Syllabus updated for ${track === "btech" ? "B.Tech" : "M.Tech"} — existing PDFs/videos kept`);
  };
  return (<div><TrackToggle tracks={tracks} track={track} setTrack={setTrack} />
    <Card style={{ padding: 18, marginBottom: 16 }}><div className="lbl" style={{ display: "flex", alignItems: "center", gap: 6 }}><VideoIcon size={13} /> Module page top — intro (shown above the modules)</div><Area label="Description" rows={2} value={intro.desc || ""} onChange={(e) => updIntro("desc", e.target.value)} /><div className="grid sm:grid-cols-2 gap-3"><Field label="Image URL" value={intro.image || ""} onChange={(e) => updIntro("image", e.target.value)} placeholder="https://…" /><Field label="Video URL (YouTube/Vimeo/MP4)" value={intro.video || ""} onChange={(e) => updIntro("video", e.target.value)} placeholder="https://youtu.be/…" /></div></Card>
    <p className="faint" style={{ fontSize: 11, marginBottom: 12 }}>Each module = videos, PDFs and text notes (added below per module). Add them in any order and reorder with the arrows. To add an intro/orientation "Module 0" before Module 1, use the button below — it's inserted at the very top of the list.</p>
    <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Btn kind="ghost" sm onClick={addFirst}><Plus size={13} /> Add Module 0 (orientation, goes first)</Btn>
      {SYLLABUS_SEP2026[track] && <Btn kind="ghost" sm onClick={applySyllabus}><Check size={13} /> Apply new syllabus ({track === "btech" ? "B.Tech" : "M.Tech"})</Btn>}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{list.map((m, i) => (<Card key={m.id} style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><span className="mono faint" style={{ fontSize: 12 }}>{String(i + 1).padStart(2, "0")}</span><input className="inline-edit" value={m.title} onChange={(e) => updTitle(m.id, e.target.value)} /><button className="iconbtn" style={{ width: 24, height: 24, fontSize: 13 }} title="Move up" onClick={() => move(i, -1)} disabled={i === 0}>&#8593;</button><button className="iconbtn" style={{ width: 24, height: 24, fontSize: 13 }} title="Move down" onClick={() => move(i, 1)} disabled={i === list.length - 1}>&#8595;</button><button className="iconbtn" onClick={() => del(m.id)}><Trash2 size={14} /></button></div>
      <div className="note" style={{ marginBottom: 10 }}><div className="lbl" style={{ display: "flex", alignItems: "center", gap: 6 }}><VideoIcon size={12} /> Videos &amp; notes &mdash; add multiple, reorder with the arrows (shown to the student above the task)</div><MediaManager media={itemMedia(m, `caee:modpdf:${m.id}`)} flash={flash} onChange={(arr) => commit({ ...db, questions: { ...db.questions, [track]: list.map((x) => x.id === m.id ? { ...x, media: arr } : x) } })} /></div>
    </Card>))}</div>
    <div style={{ marginTop: 16 }}><Btn kind="ghost" onClick={add}><Plus size={15} /> Add module</Btn></div></div>);
}
function ProjectEditor({ db, commit, allow, flash }) {
  const tracks = Object.entries(allow).filter(([, v]) => v).map(([k]) => k); const [track, setTrack] = useState(tracks[0]); if (!tracks.length) return <Empty msg="No project-edit permission." />;
  const list = db.projects[track]; const bank = (db.site.projectBank?.[track]) || [];
  const upd = (id, k, v) => commit({ ...db, projects: { ...db.projects, [track]: list.map((p) => p.id === id ? { ...p, [k]: v } : p) } });
  const add = () => commit({ ...db, projects: { ...db.projects, [track]: [...list, { id: uid(), title: "New project", desc: "Describe…", submit: "What to submit", resources: "" }] } });
  const del = (id) => commit({ ...db, projects: { ...db.projects, [track]: list.filter((p) => p.id !== id) } });
  const setBank = (arr) => commit({ ...db, site: { ...db.site, projectBank: { ...(db.site.projectBank || { btech: [], mtech: [] }), [track]: arr } } });
  const onPDF = (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.type !== "application/pdf") return flash("PDF files only"); if (f.size > 4 * 1024 * 1024) return flash("PDF too large (max 4 MB)"); const id = uid(); const r = new FileReader(); r.onload = async () => { try { await window.storage.set(`caee:projpdf:${id}`, r.result, true); setBank([...bank, { id, name: f.name, size: f.size }]); flash("Question paper added"); } catch (x) { flash("Could not store PDF"); } }; r.readAsDataURL(f); };
  const delPDF = (id) => { setBank(bank.filter((b) => b.id !== id)); }; // file kept in storage so Undo / version restore can bring it back
  const dlPDF = async (b) => { try { const res = await window.storage.get(`caee:projpdf:${b.id}`, true); if (!res?.value) return flash("PDF not found"); const a = document.createElement("a"); a.href = res.value; a.download = b.name; a.click(); } catch (x) { flash("Could not load PDF"); } };
  const shuffle = () => { const a = [...bank]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } setBank(a); flash("Shuffled — consecutive students now get different papers"); };
  return (<div><TrackToggle tracks={tracks} track={track} setTrack={setTrack} />
    <Card style={{ padding: 20, marginBottom: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}><div className="ink" style={{ fontSize: ".9rem", display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} className="c-green" /> Project question papers ({TRACK[track].tag})</div>{bank.length > 1 && <Btn kind="ghost" sm onClick={shuffle}><Sparkles size={13} /> Shuffle assignment</Btn>}</div>
      <p className="faint" style={{ fontSize: 11, marginBottom: 10 }}>Upload several PDF question papers. Each student is assigned one in rotation by enrolment order, so consecutive students never get the same paper. Add at least 2 papers for that to work.</p>
      {bank.length === 0 ? <div className="note" style={{ marginBottom: 10 }}>No papers uploaded yet.</div> : (<div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>{bank.map((b, i) => (<div key={b.id} className="row-btn" style={{ cursor: "default" }}><span className="mono faint" style={{ fontSize: 12, width: 28 }}>#{i + 1}</span><span className="ink" style={{ flex: 1, fontSize: ".82rem" }}>{b.name} <span className="faint">· {(b.size / 1024).toFixed(0)} KB</span></span><button className="iconbtn" style={{ width: 28, height: 28 }} onClick={() => dlPDF(b)}><Download size={13} /></button><button className="iconbtn" style={{ width: 28, height: 28 }} onClick={() => delPDF(b.id)}><Trash2 size={13} /></button></div>))}</div>)}
      <label className="upload"><Upload size={18} className="c-green" /><span className="muted" style={{ fontSize: ".875rem" }}>Upload a project question paper (PDF · max 4 MB)</span><input type="file" accept="application/pdf" onChange={onPDF} style={{ display: "none" }} /></label>
    </Card>
    <div className="lbl" style={{ marginBottom: 8 }}>The 4 graded project deliverables</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{list.map((p, i) => (<Card key={p.id} style={{ padding: 16 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span className="mono faint" style={{ fontSize: 12 }}>P{i + 1}</span><input className="inline-edit" value={p.title} onChange={(e) => upd(p.id, "title", e.target.value)} /><button className="iconbtn" onClick={() => del(p.id)}><Trash2 size={14} /></button></div><textarea className="ta" value={p.desc} onChange={(e) => upd(p.id, "desc", e.target.value)} rows={2} style={{ marginBottom: 8 }} /><input className="input" value={p.submit} onChange={(e) => upd(p.id, "submit", e.target.value)} placeholder="What to submit" style={{ marginBottom: 8 }} /><input className="input" value={p.resources || ""} onChange={(e) => upd(p.id, "resources", e.target.value)} placeholder="Resource links (optional)" /></Card>))}</div><div style={{ marginTop: 16 }}><Btn kind="ghost" onClick={add}><Plus size={15} /> Add project</Btn></div></div>);
}
function assignedPaper(db, u) { const track = u.track || "btech"; const bank = db.site.projectBank?.[track] || []; if (!bank.length) return null; const peers = db.users.filter((x) => x.role === "student" && (x.track || "btech") === track).sort((a, b) => (a.startDate || "").localeCompare(b.startDate || "") || a.id.localeCompare(b.id)); const order = Math.max(0, peers.findIndex((x) => x.id === u.id)); return bank[order % bank.length]; }
const TrackToggle = ({ tracks, track, setTrack }) => (<div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{tracks.map((t) => <button key={t} className={`toggle ${track === t ? "on" : ""}`} style={{ textTransform: "uppercase" }} onClick={() => setTrack(t)}>{t}</button>)}</div>);

/* ---- settings ---- */
function McqEditor({ db, commit, flash, allow }) {
  const tracks = Object.entries(allow).filter(([, v]) => v).map(([k]) => k); const [track, setTrack] = useState(tracks[0]); if (!tracks.length) return <Empty msg="No permission." />;
  const mods = db.questions[track]; const bank = db.site.mcq?.[track] || {};
  const [openM, setOpenM] = useState(null); const [busy, setBusy] = useState(null);
  const setList = (mid, arr) => commit({ ...db, site: { ...db.site, mcq: { ...db.site.mcq, [track]: { ...(db.site.mcq?.[track] || {}), [mid]: arr } } } });
  const gen = async (m) => { setBusy(m.id); const arr = await genMCQs(m.title, m.c?.prompt || "", track); setBusy(null); if (!arr || !arr.length) return flash("Could not generate — try again"); setList(m.id, arr); flash(`Generated ${arr.length} questions for ${m.title}`); };
  const addQ = (mid) => setList(mid, [...(bank[mid] || []), { id: uid(), q: "New question?", options: ["A", "B", "C", "D"], answer: 0, explain: "" }]);
  const delQ = (mid, id) => setList(mid, (bank[mid] || []).filter((x) => x.id !== id));
  const updQ = (mid, id, patch) => setList(mid, (bank[mid] || []).map((x) => x.id === id ? { ...x, ...patch } : x));
  return (<div><TrackToggle tracks={tracks} track={track} setTrack={setTrack} />
    <p className="faint" style={{ fontSize: 11, marginBottom: 12 }}>Aim for ~20 MCQs per module. Use “Generate 20” to draft them automatically (AI), then review and edit. The single ticked option is the correct answer. Students see these under Interview Questions.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{mods.map((m, i) => { const list = bank[m.id] || []; const isOpen = openM === m.id; return (<Card key={m.id} style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><span className="mono faint" style={{ fontSize: 12, width: 24 }}>{String(i + 1).padStart(2, "0")}</span><button className="ink" onClick={() => setOpenM(isOpen ? null : m.id)} style={{ flex: 1, minWidth: 140, textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: ".88rem", fontWeight: 600 }}>{m.title}</button><span className="pill pill-gold">{list.length} Q</span><Btn kind="gold" sm disabled={busy === m.id} onClick={() => gen(m)}><Sparkles size={12} /> {busy === m.id ? "Generating…" : "Generate 20"}</Btn></div>
      {isOpen && (<div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>{list.map((qq, qi) => (<div key={qq.id} className="tint" style={{ padding: 12, borderRadius: 12 }}><div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><span className="mono faint" style={{ fontSize: 11, marginTop: 8 }}>{qi + 1}</span><textarea className="ta" rows={2} style={{ flex: 1 }} value={qq.q} onChange={(e) => updQ(m.id, qq.id, { q: e.target.value })} /><button className="iconbtn" onClick={() => delQ(m.id, qq.id)}><Trash2 size={13} /></button></div>{qq.options.map((op, oi) => (<div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}><button className={`tickbox ${qq.answer === oi ? "on" : ""}`} title="Mark as correct answer" onClick={() => updQ(m.id, qq.id, { answer: oi })}>{qq.answer === oi && <Check size={11} color="#fff" />}</button><input className="input" value={op} onChange={(e) => { const o = [...qq.options]; o[oi] = e.target.value; updQ(m.id, qq.id, { options: o }); }} /></div>))}<input className="input" style={{ marginTop: 6 }} placeholder="Explanation (shown after answering)" value={qq.explain} onChange={(e) => updQ(m.id, qq.id, { explain: e.target.value })} /></div>))}<Btn kind="ghost" sm onClick={() => addQ(m.id)}><Plus size={13} /> Add question</Btn></div>)}
    </Card>); })}</div>
  </div>);
}
function SecurityEditor({ db, commit, flash }) {
  const sec = db.site.security || { note: "", rules: [], gatekeeper: "" };
  const upd = (field, value) => commit({ ...db, site: { ...db.site, security: { ...sec, [field]: value } } });
  const setRules = (arr) => upd("rules", arr);
  const updRule = (i, k, v) => setRules(sec.rules.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const addRule = () => setRules([...sec.rules, { id: uid(), pattern: "", flags: "i", msg: "New rule", risk: "medium" }]);
  const delRule = (i) => setRules(sec.rules.filter((_, j) => j !== i));
  const dlFw = () => { const b = new Blob([sec.gatekeeper || ""], { type: "text/x-c" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "caee_gatekeeper.c"; a.click(); URL.revokeObjectURL(u); };
  const dl2 = sec.deviceLock || { on: false, code: "" };
  const updDL = (k, v) => upd("deviceLock", { ...dl2, [k]: v });
  return (<div style={{ maxWidth: 820, display: "flex", flexDirection: "column", gap: 20 }}>
    <Card style={{ padding: 20 }}>
      <div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 6 }}><Lock size={15} className="c-teal" /> Admin device lock</div>
      <p className="faint" style={{ fontSize: 11, marginBottom: 12 }}>When on, admin / sub-admin sign-ins also require a one-time device authorization code on each new device — so even with the password, an admin login only works on devices you have authorized (like this one). Students are unaffected.</p>
      <button className={`toggle ${dl2.on ? "on" : ""}`} onClick={() => { if (!dl2.on && !(dl2.code || "").trim()) return flash("Set a device code first, then switch it on"); updDL("on", !dl2.on); }}><span className={`tickbox ${dl2.on ? "on" : ""}`}>{dl2.on && <Check size={11} color="#fff" />}</span> Require device authorization for admin logins</button>
      <div style={{ marginTop: 10, maxWidth: 380 }}><Field label="Device authorization code" value={dl2.code || ""} onChange={(e) => updDL("code", e.target.value)} placeholder="e.g. CAEE-OFFICE-42" /></div>
      {dl2.on && <p className="faint" style={{ fontSize: 11 }}>This device: sign out and back in once to authorize it. Changing the code de-authorizes every device.</p>}
    </Card>
    <div className="note" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><Shield size={15} className="c-teal" style={{ flex: "none", marginTop: 1 }} /><span>This screen edits the firmware screening rules and the lab gatekeeper firmware. Changes save immediately and apply to new student submissions — no website rebuild needed. A web scan is a first filter, not a guarantee: real safety comes from the gatekeeper firmware + hardware protection (dead-time, over-current trip, current-limited supply, isolated flashing).</span></div>
    <Card style={{ padding: 20 }}><div className="ink" style={{ fontSize: ".9rem", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><Edit3 size={16} className="c-green" /> Policy note</div><Area label="Shown to admins reviewing flagged code" rows={3} value={sec.note} onChange={(e) => upd("note", e.target.value)} /></Card>
    <Card style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}><div className="ink" style={{ fontSize: ".9rem", display: "flex", alignItems: "center", gap: 8 }}><ScanLine size={16} className="c-green" /> Scan rules ({sec.rules.length})</div></div>
      <p className="faint" style={{ fontSize: 11, marginBottom: 10 }}>Each rule is a JavaScript regular expression tested against the submitted code. Risk medium/high holds the code for review. Invalid regex is ignored safely.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{sec.rules.map((r, i) => (<div key={r.id} className="tint" style={{ padding: 10, borderRadius: 11 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input className="input mono" style={{ flex: 2, minWidth: 180, fontSize: 12 }} value={r.pattern} onChange={(e) => updRule(i, "pattern", e.target.value)} placeholder="regex pattern" />
          <input className="input mono" style={{ width: 56, fontSize: 12 }} value={r.flags} onChange={(e) => updRule(i, "flags", e.target.value)} placeholder="flags" />
          <select className="sel" style={{ width: 96 }} value={r.risk} onChange={(e) => updRule(i, "risk", e.target.value)}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>
          <button className="iconbtn" onClick={() => delRule(i)}><Trash2 size={13} /></button>
        </div>
        <input className="input" style={{ marginTop: 6, fontSize: 12 }} value={r.msg} onChange={(e) => updRule(i, "msg", e.target.value)} placeholder="message shown when matched" />
      </div>))}</div>
      <div style={{ marginTop: 12 }}><Btn kind="ghost" onClick={addRule}><Plus size={15} /> Add rule</Btn></div>
    </Card>
    <Card style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}><div className="ink" style={{ fontSize: ".9rem", display: "flex", alignItems: "center", gap: 8 }}><Cpu size={16} className="c-green" /> Lab gatekeeper firmware</div><div style={{ display: "flex", gap: 8 }}><Btn kind="ghost" sm onClick={() => navigator.clipboard?.writeText(sec.gatekeeper || "")}><Copy size={12} /> Copy</Btn><Btn kind="ghost" sm onClick={dlFw}><Download size={12} /> .c</Btn></div></div>
      <p className="faint" style={{ fontSize: 11, marginBottom: 10 }}>The safety wrapper that runs on the board and owns dead-time, the over-current break, the watchdog and duty clamps. Student logic only runs inside student_control_step(). Paste/replace this with your own as your hardware changes.</p>
      <textarea className="ta" rows={16} value={sec.gatekeeper || ""} onChange={(e) => upd("gatekeeper", e.target.value)} style={{ fontSize: 11.5 }} />
    </Card>
  </div>);
}
function WorkshopAdmin({ db, commit, flash }) {
  const ws = db.site.workshop || { btech: { packs: [] }, mtech: { packs: [] } };
  const [track, setTrack] = useState("btech");
  const [openP, setOpenP] = useState(null); const [busy, setBusy] = useState(null);
  const regs = (db.workshopRegs || []).filter((r) => r.track === track);
  const upd = (patch) => commit({ ...db, site: { ...db.site, workshop: { ...ws, ...patch } } });
  const updTrack = (patch) => upd({ [track]: { ...ws[track], ...patch } });
  const packs = ws[track]?.packs || [];
  const setPacks = (arr) => updTrack({ packs: arr });
  const updP = (i, k, v) => setPacks(packs.map((p, j) => j === i ? { ...p, [k]: v } : p));
  const addP = () => setPacks([...packs, { id: uid(), title: `Module ${packs.length + 1}`, videoUrl: "", note: "", mcq: [] }]);
  const delP = (i) => setPacks(packs.filter((_, j) => j !== i));
  const setQs = (pi, arr) => updP(pi, "mcq", arr);
  const addQ = (pi) => setQs(pi, [...(packs[pi].mcq || []), { id: uid(), q: "New question?", options: ["A", "B", "C", "D"], answer: 0, explain: "" }]);
  const delQ = (pi, id) => setQs(pi, (packs[pi].mcq || []).filter((x) => x.id !== id));
  const updQ = (pi, id, patch) => setQs(pi, (packs[pi].mcq || []).map((x) => x.id === id ? { ...x, ...patch } : x));
  const gen = async (pi) => { const p = packs[pi]; setBusy(p.id); const arr = await genMCQs(p.title + " — " + (ws[track]?.title || ""), p.note || "", track); setBusy(null); if (!arr || !arr.length) return flash("Could not generate — try again"); setQs(pi, arr.slice(0, 10)); flash(`Generated ${Math.min(10, arr.length)} questions`); };
  const exportRegs = () => exportCSV(["Name", "Email", "Phone", "College", "Status", "When"], regs.map((r) => [r.name, r.email, r.phone, r.college, r.status, r.at]), `caee-workshop-${track}.csv`);
  const totalQ = packs.reduce((n, p) => n + (p.mcq ? p.mcq.length : 0), 0);
  return (<div>
    <Card style={{ padding: 20, marginBottom: 16 }}>
      <div className="ink" style={{ fontSize: ".9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><CalendarClock size={16} className="c-green" /> Workshop registration</div>
      <div className="grid sm:grid-cols-3 gap-3" style={{ alignItems: "end" }}>
        <div><span className="lbl">Registration open</span><button className={ws.open !== false ? "access-on" : "access-off"} onClick={() => upd({ open: !(ws.open !== false) })}>{ws.open !== false ? <><Check size={11} /> Open</> : <><Lock size={11} /> Closed</>}</button></div>
        <Field label="Registration ends on" type="date" value={ws.deadline || ""} onChange={(e) => upd({ deadline: e.target.value })} />
        <div style={{ display: "flex", gap: 8 }}><Field label="Final Qs" value={String(ws.finalCount || 20)} onChange={(e) => upd({ finalCount: Math.max(1, parseInt(e.target.value) || 20) })} /><Field label="Pass %" value={String(ws.passPct || 70)} onChange={(e) => upd({ passPct: Math.max(1, Math.min(100, parseInt(e.target.value) || 70)) })} /></div>
      </div>
      <p className="faint" style={{ fontSize: 11, marginTop: 8 }}>The final assessment pulls {ws.finalCount || 20} random questions from this track's module quizzes and needs {ws.passPct || 70}% to issue the free certificate.</p>
    </Card>
    <TrackToggle tracks={["btech", "mtech"]} track={track} setTrack={setTrack} />
    <Card style={{ padding: 20, marginBottom: 16 }}>
      <Field label="Workshop title" value={ws[track]?.title || ""} onChange={(e) => updTrack({ title: e.target.value })} />
      <Area label="Intro text" rows={2} value={ws[track]?.intro || ""} onChange={(e) => updTrack({ intro: e.target.value })} />
      <div className="lbl" style={{ marginTop: 8, marginBottom: 6 }}>Modules ({packs.length}) · {totalQ} quiz questions total</div>
      {packs.map((p, i) => { const isOpen = openP === p.id; const qs = p.mcq || []; return (<Card key={p.id} style={{ padding: 14, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span className="mono faint" style={{ fontSize: 12 }}>{i + 1}</span><input className="input" style={{ flex: 1, minWidth: 160 }} value={p.title} onChange={(e) => updP(i, "title", e.target.value)} placeholder="Module title" /><span className="pill pill-gold">{qs.length} Q</span><button className="iconbtn" onClick={() => delP(i)}><Trash2 size={13} /></button></div>
        <div style={{ marginTop: 6 }}><div className="lbl" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><VideoIcon size={12} /> Videos &amp; notes &mdash; add multiple, reorder with the arrows</div><MediaManager media={itemMedia(p, `caee:wspdf:${p.id}`)} flash={flash} onChange={(arr) => updP(i, "media", arr)} /></div>
        <input className="input" style={{ marginTop: 6 }} value={p.note} onChange={(e) => updP(i, "note", e.target.value)} placeholder="Short note under the video" />
        {null}
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}><Btn kind="ghost" sm onClick={() => setOpenP(isOpen ? null : p.id)}>{isOpen ? "Hide" : "Edit"} quiz ({qs.length})</Btn><Btn kind="gold" sm disabled={busy === p.id} onClick={() => gen(i)}><Sparkles size={12} /> {busy === p.id ? "Generating…" : "Generate 10"}</Btn></div>
        {isOpen && (<div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>{qs.map((q, qi) => (<div key={q.id} className="tint" style={{ padding: 10, borderRadius: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><span className="mono faint" style={{ fontSize: 11, marginTop: 8 }}>{qi + 1}</span><textarea className="ta" rows={2} style={{ flex: 1 }} value={q.q} onChange={(e) => updQ(i, q.id, { q: e.target.value })} /><button className="iconbtn" onClick={() => delQ(i, q.id)}><Trash2 size={12} /></button></div>
          {q.options.map((op, oi) => (<div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}><button className={`tickbox ${q.answer === oi ? "on" : ""}`} title="Mark correct" onClick={() => updQ(i, q.id, { answer: oi })}>{q.answer === oi && <Check size={11} color="#fff" />}</button><input className="input" value={op} onChange={(e) => { const o = [...q.options]; o[oi] = e.target.value; updQ(i, q.id, { options: o }); }} /></div>))}
          <input className="input" style={{ marginTop: 5 }} placeholder="Explanation (optional)" value={q.explain} onChange={(e) => updQ(i, q.id, { explain: e.target.value })} />
        </div>))}<Btn kind="ghost" sm onClick={() => addQ(i)}><Plus size={12} /> Add question</Btn></div>)}
      </Card>); })}
      <Btn kind="ghost" onClick={addP}><Plus size={15} /> Add pack</Btn>
    </Card>
    <Card style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}><div className="ink" style={{ fontSize: ".9rem", display: "flex", alignItems: "center", gap: 8 }}><Users size={16} className="c-green" /> Registrations ({regs.length})</div>{regs.length > 0 && <Btn kind="ghost" sm onClick={exportRegs}><Download size={12} /> CSV</Btn>}</div>
      {regs.length === 0 ? <Empty msg="No workshop registrations yet for this track." /> : (<div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>College</th><th>Status</th><th>When</th></tr></thead><tbody>{regs.map((r) => (<tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{r.phone}</td><td>{r.college}</td><td>{r.status}</td><td className="faint">{r.at}</td></tr>))}</tbody></table></div>)}
    </Card>
  </div>);
}
function SettingsTab({ db, commit, flash, who, can }) {
  const s = db.site; const [cd, setCd] = useState(s.courseDefaults);
  const upd = (k, v) => commit({ ...db, site: { ...s, [k]: v } });
  const updObj = (k, field, v) => commit({ ...db, site: { ...s, [k]: { ...s[k], [field]: v } } });
  const updArr = (key, i, field, v) => commit({ ...db, site: { ...s, [key]: s[key].map((x, j) => j === i ? { ...x, [field]: v } : x) } });
  const addArr = (key, obj) => commit({ ...db, site: { ...s, [key]: [...s[key], { id: uid(), ...obj }] } });
  const delArr = (key, i) => commit({ ...db, site: { ...s, [key]: s[key].filter((_, j) => j !== i) } });
  const updShow = (i, k, v) => commit({ ...db, site: { ...s, showcase: s.showcase.map((c, j) => j === i ? { ...c, [k]: v } : c) } });
  const updPrice = (track, field, v) => commit({ ...db, site: { ...s, pricing: { ...s.pricing, [track]: { ...s.pricing[track], [field]: field === "period" ? v : Number(v) || 0 } } } });
  const updReg = (field, v) => commit({ ...db, site: { ...s, registration: { ...s.registration, [field]: v } } });
  const applyDuration = (track) => { const days = Number(cd[track]) || 0; commit({ ...db, site: { ...s, courseDefaults: { ...s.courseDefaults, [track]: days } }, users: db.users.map((u) => u.role === "student" && u.track === track ? { ...u, durationDays: days } : u), audit: auditPush(db, `Set ${TRACK[track].tag} duration to ${days} days (all)`, who) }); flash(`${TRACK[track].tag} set to ${days} days for all current students`); };
  return (<div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>
    {can("edit_registration") && (<Card style={{ padding: 20 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 14 }}><CalendarClock size={16} className="c-green" /> Registration</div><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}><button className={`toggle ${s.registration.open ? "on" : ""}`} onClick={() => updReg("open", !s.registration.open)}><span className={`tickbox ${s.registration.open ? "on" : ""}`}>{s.registration.open && <Check size={11} color="#fff" />}</span> Registration {s.registration.open ? "OPEN" : "CLOSED"}</button></div><div className="grid sm:grid-cols-2 gap-3"><Field label="Next registration date (text)" value={s.registration.nextDate} onChange={(e) => updReg("nextDate", e.target.value)} placeholder="e.g. 1 July 2026" /><Field label="Note (optional)" value={s.registration.note} onChange={(e) => updReg("note", e.target.value)} /></div><div className="grid sm:grid-cols-2 gap-3" style={{ marginTop: 12 }}><Field label="Minimum CGPA (info shown to applicants)" value={s.registration.minCgpa || ""} onChange={(e) => updReg("minCgpa", e.target.value)} placeholder="e.g. 7.0" /><div /></div><div className="lbl" style={{ marginTop: 6 }}>TagMango payment links (applicant gets these after registering)</div><div className="grid sm:grid-cols-2 gap-3"><Field label="B.Tech pay link" value={s.registration.payBtech || ""} onChange={(e) => updReg("payBtech", e.target.value)} placeholder="https://…tagmango…" /><Field label="M.Tech pay link" value={s.registration.payMtech || ""} onChange={(e) => updReg("payMtech", e.target.value)} placeholder="https://…tagmango…" /></div></Card>)}
    {(can("edit_registration") || can("edit_content")) && (<Card style={{ padding: 20 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 6 }}><Cpu size={16} className="c-teal" /> Virtual labs</div><p className="faint" style={{ fontSize: 11, marginBottom: 12 }}>The lab pages live at /labs/btech_lab.html and /labs/mtech_lab.html on your hosting (or paste full URLs below if hosted elsewhere). The compiler server URL is optional — without it the labs run in demo mode.</p><div className="grid sm:grid-cols-2 gap-3"><Field label="B.Tech lab URL (optional override)" value={(s.labs && s.labs.btech) || ""} onChange={(e) => updObj("labs", "btech", e.target.value)} placeholder="/labs/btech_lab.html" /><Field label="M.Tech lab URL (optional override)" value={(s.labs && s.labs.mtech) || ""} onChange={(e) => updObj("labs", "mtech", e.target.value)} placeholder="/labs/mtech_lab.html" /></div><Field label="Compiler server URL (COMPILE_URL — optional)" value={(s.labs && s.labs.compile) || ""} onChange={(e) => updObj("labs", "compile", e.target.value)} placeholder="https://xxx.onrender.com/run" /><div style={{ marginTop: 8 }}><button className={`toggle ${s.labs && s.labs.required ? "on" : ""}`} onClick={() => updObj("labs", "required", !(s.labs && s.labs.required))}><span className={`tickbox ${s.labs && s.labs.required ? "on" : ""}`}>{s.labs && s.labs.required && <Check size={11} color="#fff" />}</span> Require lab completion before projects unlock</button><p className="faint" style={{ fontSize: 11, marginTop: 6 }}>Only enable this once the compiler server is live — the lab’s module Checks need it to PASS. Students then must pass all lab modules (plus all course modules) before the build projects open.</p></div></Card>)}
    {(can("manage_ai")) && (<Card style={{ padding: 20 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 6 }}><Sparkles size={16} className="c-teal" /> AI mentor &amp; API key</div><p className="faint" style={{ fontSize: 11, marginBottom: 12 }}>Powers the Mentor replies on discussion boards, question generation, the security scan and your AI feedback drafts. Get a key at console.anthropic.com.</p><Field label="Anthropic API key" type="password" value={s.aiKey || ""} onChange={(e) => upd("aiKey", e.target.value)} placeholder="sk-ant-…" /><div className="note" style={{ fontSize: 11 }}>Important: on a public website this key is technically readable by visitors, so (1) set a monthly spend limit on the key in the Anthropic console, and (2) for full protection move it to a small server proxy later — everything here will keep working unchanged.</div></Card>)}
    {can("edit_content") && (<Card style={{ padding: 20 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 6 }}><VideoIcon size={16} className="c-teal" /> Landing: lab video &amp; price value stack</div><Field label="Lab demo video URL (60–90s, YouTube/Vimeo — shows on the front page)" value={s.heroVideo || ""} onChange={(e) => upd("heroVideo", e.target.value)} placeholder="https://youtu.be/…" />
    {["btech", "mtech"].map((t) => { const vs = (s.valueStack && s.valueStack[t]) || []; const setVs = (arr) => upd("valueStack", { ...(s.valueStack || {}), [t]: arr }); return (<div key={t} style={{ marginTop: 14 }}><div className="lbl" style={{ marginBottom: 6 }}>{t === "btech" ? "B.Tech" : "M.Tech"} value stack (shown above the price)</div>{vs.map((r, i) => (<div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}><input className="input" style={{ flex: 2 }} value={r.label} placeholder="e.g. Remote lab access" onChange={(e) => setVs(vs.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} /><input className="input" style={{ flex: 1 }} value={r.value} placeholder="₹ value" onChange={(e) => setVs(vs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} /><button className="iconbtn" onClick={() => setVs(vs.filter((_, j) => j !== i))}><Trash2 size={13} /></button></div>))}<Btn sm kind="ghost" onClick={() => setVs([...vs, { label: "", value: "" }])}><Plus size={13} /> Add row</Btn></div>); })}
    <p className="faint" style={{ fontSize: 11, marginTop: 10 }}>Typical rows: Remote lab access, Mentor code review, Verifiable certificate, Placement support. The total shows struck-through above your actual price.</p></Card>)}
    {can("edit_pricing") && (<Card style={{ padding: 20 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 14 }}><IndianRupee size={16} className="c-green" /> Pricing (MRP shown struck-through, then the offer price)</div>{["btech", "mtech"].map((t) => (<div key={t} style={{ marginBottom: 12 }}><div className="lbl">{TRACK[t].tag}</div><div className="grid sm:grid-cols-3 gap-3"><Field label="MRP (₹)" type="number" value={s.pricing[t].mrp} onChange={(e) => updPrice(t, "mrp", e.target.value)} /><Field label="Price (₹)" type="number" value={s.pricing[t].price} onChange={(e) => updPrice(t, "price", e.target.value)} /><Field label="Period" value={s.pricing[t].period} onChange={(e) => updPrice(t, "period", e.target.value)} /></div><div style={{ marginTop: 4 }}><PriceTag p={s.pricing[t]} /></div></div>))}</Card>)}
    {can("manage_students") && (<Card style={{ padding: 20 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 14 }}><Hourglass size={16} className="c-green" /> Course duration (≈6 months = 180 days)</div>{["btech", "mtech"].map((t) => (<div key={t} style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 10 }}><div style={{ flex: 1 }}><span className="lbl">{TRACK[t].tag} — days</span><input className="input" type="number" value={cd[t]} onChange={(e) => setCd({ ...cd, [t]: e.target.value })} /></div><Btn onClick={() => applyDuration(t)}><Save size={14} /> Apply to all {TRACK[t].tag}</Btn></div>))}<p className="faint" style={{ fontSize: 11 }}>Sets all current students of that track and the default for new enrolments. Per-student ±1-day is on the Students table.</p></Card>)}
    {can("edit_content") && (<>
      <Card style={{ padding: 20 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 12 }}><Edit3 size={16} className="c-green" /> Hero, about & contact</div><Field label="Headline tagline" value={s.heroTag} onChange={(e) => upd("heroTag", e.target.value)} /><Area label="About paragraph" rows={4} value={s.about} onChange={(e) => upd("about", e.target.value)} /><Field label="WhatsApp number (digits, country code)" value={s.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} /></Card>
      <Card style={{ padding: 20 }}><div className="ink" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem", marginBottom: 12 }}><MessageSquare size={16} className="c-green" /> Talk to our mentor</div><div className="grid sm:grid-cols-2 gap-3"><Field label="Name" value={s.mentor.name} onChange={(e) => updObj("mentor", "name", e.target.value)} /><Field label="Role" value={s.mentor.role} onChange={(e) => updObj("mentor", "role", e.target.value)} /><Field label="Email" value={s.mentor.email} onChange={(e) => updObj("mentor", "email", e.target.value)} /><Field label="Phone" value={s.mentor.phone} onChange={(e) => updObj("mentor", "phone", e.target.value)} /><div style={{ gridColumn: "1 / -1" }}><Field label="Photo URL" value={s.mentor.photo} onChange={(e) => updObj("mentor", "photo", e.target.value)} placeholder="https://…" /></div></div></Card>
      <Card style={{ padding: 20 }}><div className="ink" style={{ fontSize: ".9rem", marginBottom: 12 }}>Showcase cards (image OR video URL + description)</div>{s.showcase.map((c, i) => (<div key={i} className={`grid sm:grid-cols-2 gap-3 ${i < s.showcase.length - 1 ? "divider" : ""}`} style={{ paddingBottom: 12, marginBottom: 12 }}><Field label="Title" value={c.title} onChange={(e) => updShow(i, "title", e.target.value)} /><Field label="Tag" value={c.tag} onChange={(e) => updShow(i, "tag", e.target.value)} /><Field label="Image URL" value={c.img} onChange={(e) => updShow(i, "img", e.target.value)} placeholder="https://…" /><Field label="Video URL" value={c.video} onChange={(e) => updShow(i, "video", e.target.value)} placeholder="https://youtu.be/…" /><div style={{ gridColumn: "1 / -1" }}><Field label="Description" value={c.desc} onChange={(e) => updShow(i, "desc", e.target.value)} /></div></div>))}</Card>
      <EditList title="How-it-works steps" items={s.steps} fields={[["title", "Title"], ["desc", "Description", true]]} onChange={(i, f, v) => updArr("steps", i, f, v)} onAdd={() => addArr("steps", { title: "Step", desc: "Describe" })} onDel={(i) => delArr("steps", i)} />
      <Card style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div className="ink" style={{ fontSize: ".9rem", display: "flex", alignItems: "center", gap: 8 }}><MessageSquare size={16} className="c-green" /> News &amp; updates (front-page feed)</div>{s.posts?.length > 0 && <Btn kind="danger" sm onClick={() => commit({ ...db, site: { ...s, posts: [] } })}><Trash2 size={12} /> Clear all</Btn>}</div>{(s.posts || []).map((po, i) => (<div key={po.id} className={i < s.posts.length - 1 ? "divider" : ""} style={{ paddingBottom: 12, marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "flex-end" }}><button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => delArr("posts", i)}><Trash2 size={13} /></button></div><div className="grid sm:grid-cols-2 gap-3"><Field label="Date" value={po.date} onChange={(e) => updArr("posts", i, "date", e.target.value)} /><Field label="Image URL" value={po.image} onChange={(e) => updArr("posts", i, "image", e.target.value)} placeholder="https://…" /></div><Field label="Title" value={po.title} onChange={(e) => updArr("posts", i, "title", e.target.value)} /><Area label="Body" rows={3} value={po.body} onChange={(e) => updArr("posts", i, "body", e.target.value)} /></div>))}<Btn kind="ghost" onClick={() => addArr("posts", { title: "New post", date: TODAY(), body: "", image: "" })}><Plus size={15} /> Add post</Btn></Card>
      <EditList title="Testimonials" items={s.testimonials} fields={[["name", "Name"], ["role", "Role"], ["quote", "Quote", true]]} onChange={(i, f, v) => updArr("testimonials", i, f, v)} onAdd={() => addArr("testimonials", { name: "Name", role: "Role", quote: "Quote" })} onDel={(i) => delArr("testimonials", i)} />
      <EditList title="FAQ" items={s.faq} fields={[["q", "Question"], ["a", "Answer", true]]} onChange={(i, f, v) => updArr("faq", i, f, v)} onAdd={() => addArr("faq", { q: "Question?", a: "Answer." })} onDel={(i) => delArr("faq", i)} />
      <EditList title="Team" items={s.team} fields={[["name", "Name"], ["role", "Role"]]} onChange={(i, f, v) => updArr("team", i, f, v)} onAdd={() => addArr("team", { name: "Name", role: "Role" })} onDel={(i) => delArr("team", i)} />
      <EditList title="Resume & LinkedIn prep (student section)" items={s.resume || []} fields={[["title", "Heading"], ["body", "Content", true]]} onChange={(i, f, v) => updArr("resume", i, f, v)} onAdd={() => addArr("resume", { title: "New tip", body: "" })} onDel={(i) => delArr("resume", i)} />
      <Card style={{ padding: 20 }}><div className="ink" style={{ fontSize: ".9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><TrendingUp size={16} className="c-green" /> Career roadmap (student section)</div>{(s.career?.roadmap || []).map((r, i) => (<div key={r.id} className={i < s.career.roadmap.length - 1 ? "divider" : ""} style={{ paddingBottom: 12, marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "flex-end" }}><button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => commit({ ...db, site: { ...s, career: { ...s.career, roadmap: s.career.roadmap.filter((_, j) => j !== i) } } })}><Trash2 size={13} /></button></div><Field label="Step" value={r.step} onChange={(e) => commit({ ...db, site: { ...s, career: { ...s.career, roadmap: s.career.roadmap.map((x, j) => j === i ? { ...x, step: e.target.value } : x) } } })} /><Area label="Detail" rows={2} value={r.desc} onChange={(e) => commit({ ...db, site: { ...s, career: { ...s.career, roadmap: s.career.roadmap.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) } } })} /></div>))}<Btn kind="ghost" onClick={() => commit({ ...db, site: { ...s, career: { ...s.career, roadmap: [...(s.career?.roadmap || []), { id: uid(), step: "New step", desc: "" }] } } })}><Plus size={15} /> Add step</Btn></Card>
      <Card style={{ padding: 20 }}><div className="ink" style={{ fontSize: ".9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} className="c-green" /> Career resources / datasheets (student section)</div>{(s.career?.resources || []).map((r, i) => (<div key={r.id} className={i < s.career.resources.length - 1 ? "divider" : ""} style={{ paddingBottom: 12, marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "flex-end" }}><button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => commit({ ...db, site: { ...s, career: { ...s.career, resources: s.career.resources.filter((_, j) => j !== i) } } })}><Trash2 size={13} /></button></div><Field label="Title" value={r.title} onChange={(e) => commit({ ...db, site: { ...s, career: { ...s.career, resources: s.career.resources.map((x, j) => j === i ? { ...x, title: e.target.value } : x) } } })} /><Field label="URL" value={r.url} onChange={(e) => commit({ ...db, site: { ...s, career: { ...s.career, resources: s.career.resources.map((x, j) => j === i ? { ...x, url: e.target.value } : x) } } })} /><Field label="Note" value={r.note} onChange={(e) => commit({ ...db, site: { ...s, career: { ...s.career, resources: s.career.resources.map((x, j) => j === i ? { ...x, note: e.target.value } : x) } } })} /></div>))}<Btn kind="ghost" onClick={() => commit({ ...db, site: { ...s, career: { ...s.career, resources: [...(s.career?.resources || []), { id: uid(), title: "Resource", url: "", note: "" }] } } })}><Plus size={15} /> Add resource</Btn></Card>
    </>)}
    <div className="faint" style={{ fontSize: 12 }}>All changes appear immediately. You only see the sections you've been granted.</div>
  </div>);
}
function EditList({ title, items, fields, onChange, onAdd, onDel }) {
  return (<Card style={{ padding: 20 }}><div className="ink" style={{ fontSize: ".9rem", marginBottom: 12 }}>{title}</div>{items.map((it, i) => (<div key={it.id || i} className={i < items.length - 1 ? "divider" : ""} style={{ paddingBottom: 12, marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "flex-end" }}><button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => onDel(i)}><Trash2 size={13} /></button></div>{fields.map(([f, label, big]) => big ? <Area key={f} label={label} rows={2} value={it[f]} onChange={(e) => onChange(i, f, e.target.value)} /> : <Field key={f} label={label} value={it[f]} onChange={(e) => onChange(i, f, e.target.value)} />)}</div>))}<Btn kind="ghost" onClick={onAdd}><Plus size={15} /> Add</Btn></Card>);
}


/* ================================================================== */
/* ============ STM32 REMOTE AUTOMOTIVE ENGINEERING LAB ============== */
/* ================================================================== */
// Everything for the remote hardware lab lives under db.remoteLab:
//   settings      public page / programme access / scheduler + safety policy / media
//   projects      the 13 Automotive ECU Engineering Projects (+ per-project run policy)
//   stations      office hardware stations (ST-LINK serials, capabilities)
//   entitlements  { [userId]: { status, startAt, expiresAt, program, source, by, at } }
//   requests      public access requests
//   runs / jobs / events   written by the lab server once the office Lab Agent is live
// Nothing here fakes hardware: until the lab server reports stations, jobs and runs,
// the pages say "not connected" / "no runs yet".
const RL_PROJECTS = [
  ["P01", "CAN TX/RX Bring-Up – Engine RPM", "Receive the Engine RPM frame (ID 0x100, 500 kbit/s), decode it, count RX frames and detect a 500 ms communication loss."],
  ["P02", "CAN Filtering", "Implement acceptance filters and message routing rules."],
  ["P03", "Signal Encoding & Decoding", "Pack and unpack production-style vehicle signals."],
  ["P04", "Engine ECU", "Develop RPM, temperature, throttle and status messaging."],
  ["P05", "Body Control Module", "Implement door, lighting, indicator and wiper logic."],
  ["P06", "Instrument Cluster ECU", "Decode multi-ECU data and render vehicle state."],
  ["P07", "Brake / ABS ECU", "Process wheel-speed inputs and detect lock conditions."],
  ["P08", "Battery ECU", "Monitor voltage, current, temperature and SOC conditions."],
  ["P09", "Heartbeat & Timeout Supervision", "Detect missing ECUs and communication loss."],
  ["P10", "Alive Counter & Data Integrity", "Validate counters, sequence and payload health."],
  ["P11", "CAN Fault Management", "Handle invalid signals, timeouts and recovery states."],
  ["P12", "Automotive Gateway ECU", "Route selected frames between CAN-A and CAN-B."],
  ["P13", "Diagnostics & Vehicle Network Capstone", "Integrate diagnostics and complete virtual vehicle behaviour."],
];
const RL_PROGRAMS = ["B.Tech", "M.Tech", "Working Professional", "Other"];
const RL_STATUSES = ["Active", "Pending", "Suspended", "Expired"];
const RL_DEFAULTS = {
  settings: {
    publicPage: true, homeSection: true,
    heroTitle: "STM32 Remote Automotive Engineering Lab",
    heroSub: "Write ECU firmware in your browser and run it on physical STM32 NUCLEO-G474RE hardware in the CAEE lab — over real CAN-A and CAN-B vehicle networks, with automated scenarios, measurements and scoring.",
    launchNote: "Now accepting access requests for the first hardware cohort.",
    notifyEmail: "", statusUrl: "",
    defaultDays: 90,
    programAccess: { btech: { on: false }, mtech: { on: false } },
    scheduler: { perUserActive: 1, perUserQueued: 3, maxAttempts: 2, leaseSec: 120, buildTimeoutSec: 60, policy: "fifo-fair" },
    runtime: { absoluteMaxSec: 60, heartbeatMs: 1000, violationLimit: 3, violationWindowH: 24 },
    media: { dashboard: "/remote-lab/remote-lab-dashboard.jpg", rack: "", bench: "", run: "", video: "" },
  },
  projects: RL_PROJECTS.map(([id, title, desc]) => ({ id, title, desc, enabled: true, maxWallSec: 20, canIds: "", maxFps: 200, bitrate: 500, pwm: false })),
  stations: [{ id: "CAE-01", enabled: true, caps: { NUCLEO_G474RE: true, CAN_A: true, CAN_B: true }, note: "Office station" }],
};
function rlOf(db) {
  const r = (db && db.remoteLab) || {}; const s = r.settings || {}; const d = RL_DEFAULTS.settings;
  return {
    settings: { ...d, ...s, programAccess: { btech: { ...d.programAccess.btech, ...((s.programAccess || {}).btech || {}) }, mtech: { ...d.programAccess.mtech, ...((s.programAccess || {}).mtech || {}) } }, scheduler: { ...d.scheduler, ...(s.scheduler || {}) }, runtime: { ...d.runtime, ...(s.runtime || {}) }, media: { ...d.media, ...(s.media || {}) } },
    projects: r.projects && r.projects.length ? r.projects : RL_DEFAULTS.projects,
    stations: Array.isArray(r.stations) ? r.stations : RL_DEFAULTS.stations,
    entitlements: r.entitlements || {}, requests: r.requests || [], runs: r.runs || [], jobs: r.jobs || [], events: r.events || [],
  };
}
const rlPatch = (db, patch) => ({ ...db, remoteLab: { ...(db.remoteLab || {}), ...patch } });
const rlSettings = (db, patch) => { const cur = (db.remoteLab && db.remoteLab.settings) || {}; return rlPatch(db, { settings: { ...cur, ...patch } }); };
const rlProgTrack = (p) => (p === "M.Tech" ? "mtech" : "btech");
const rlProgOf = (u) => u.program || (u.track === "mtech" ? "M.Tech" : "B.Tech");
const RL_DAY = 86400000;
// Cryptographically random one-time password (8 digits). The existing Activate flow
// checks it server-side and forces the student to set their own password.
function rlOtp() { try { const a = new Uint32Array(1); crypto.getRandomValues(a); return String(10000000 + (a[0] % 90000000)); } catch (e) { return genOtp() + genOtp().slice(0, 2); } }
// Single source of truth for "may this student use the remote lab right now?"
function rlAccess(db, u) {
  if (!u || u.role !== "student") return { ok: false, status: "None", source: null, days: null };
  const rl = rlOf(db); const e = rl.entitlements[u.id]; const now = Date.now();
  if (e) {
    const exp = e.expiresAt ? new Date(e.expiresAt).getTime() : null; const days = exp == null ? null : Math.max(0, Math.ceil((exp - now) / RL_DAY));
    const base = { source: e.source === "Program" ? "Program" : "Individual", days, e };
    if (e.status === "Suspended") return { ok: false, status: "Suspended", ...base };
    if (e.status === "Pending") return { ok: false, status: "Pending", ...base };
    if (e.status === "Expired" || (exp != null && exp <= now)) return { ok: false, status: "Expired", ...base, days: 0 };
    if (e.startAt && new Date(e.startAt).getTime() > now) return { ok: false, status: "Scheduled", ...base };
    return { ok: true, status: "Active", ...base };
  }
  const pa = rl.settings.programAccess[u.track];
  if (pa && pa.on && u.access && !u.labOnly) { const d = daysLeft(u); if (d != null && d <= 0) return { ok: false, status: "Expired", source: "Program", days: 0 }; return { ok: true, status: "Active", source: "Program", days: d }; }
  return { ok: false, status: "None", source: null, days: null };
}
const rlBadgeCls = (st) => ({ Active: "b-pass", Pending: "b-pending", Scheduled: "b-pending", Suspended: "b-fail", Expired: "b-ns", None: "b-ns" }[st] || "b-ns");
const RlStatus = ({ st }) => <span className={`badge ${rlBadgeCls(st)}`}>{st === "None" ? "No access" : st}</span>;
// Create a lab-only account, or attach an entitlement to an existing student (never a duplicate account).
function rlProvision(db, row, who, source) {
  const email = String(row.email || "").trim().toLowerCase(); const days = Math.max(1, Number(row.days) || 1);
  const existing = db.users.find((u) => (u.email || "").toLowerCase() === email);
  if (existing && existing.role !== "student") return { db, result: "failed", reason: "Email belongs to an admin account" };
  const now = Date.now(); const ent = { status: row.status === "Pending" ? "Pending" : "Active", startAt: new Date(now).toISOString(), expiresAt: new Date(now + days * RL_DAY).toISOString(), program: row.program || "B.Tech", source, by: who, at: NOW() };
  const rl = rlOf(db); let users = db.users; let otp = null; let user = existing; let result = "updated";
  if (!existing) {
    otp = rlOtp(); result = "created";
    user = { id: uid(), role: "student", name: String(row.name || "").trim(), email, phone: String(row.phone || "").trim(), program: row.program || "B.Tech", track: rlProgTrack(row.program), labOnly: true, access: false, durationDays: days, startDate: TODAY(), password: otp, mustSetPassword: true };
    users = [...db.users, user];
  } else if (row.issueOtp) {
    otp = rlOtp(); users = db.users.map((u) => u.id === existing.id ? { ...u, password: otp, mustSetPassword: true } : u);
  }
  const next = rlPatch({ ...db, users }, { entitlements: { ...rl.entitlements, [user.id]: { ...(rl.entitlements[user.id] || {}), ...ent } } });
  return { db: next, result, otp, user };
}
// ---- spreadsheet readers (no third-party code: CSV parser + minimal .xlsx reader) ----
function rlParseCsv(text) {
  const rows = []; let row = [], cell = "", q = false; text = String(text || "").replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
    if (ch === '"') q = true; else if (ch === ",") { row.push(cell); cell = ""; } else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}
async function rlReadXlsx(buf) {
  const u8 = new Uint8Array(buf); const dv = new DataView(buf); let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw Error("This is not a valid .xlsx file. Save it as .xlsx or CSV and try again.");
  const n = dv.getUint16(eocd + 10, true); let p = dv.getUint32(eocd + 16, true); const files = {};
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw Error("The .xlsx file is damaged.");
    const nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    files[new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen))] = { method: dv.getUint16(p + 10, true), csize: dv.getUint32(p + 20, true), usize: dv.getUint32(p + 24, true), off: dv.getUint32(p + 42, true) };
    p += 46 + nlen + elen + clen;
  }
  const read = async (name) => {
    const f = files[name]; if (!f) return null; if (f.usize > 25e6) throw Error("The spreadsheet is too large.");
    const st = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true); const data = u8.subarray(st, st + f.csize);
    if (f.method === 0) return new TextDecoder().decode(data);
    if (f.method !== 8) throw Error("Unsupported .xlsx compression — save the sheet as CSV.");
    if (typeof DecompressionStream === "undefined") throw Error("This browser cannot open .xlsx files — save the sheet as CSV.");
    const out = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
    return new TextDecoder().decode(out);
  };
  const P = new DOMParser(); let sheetPath = "xl/worksheets/sheet1.xml";
  const wb = await read("xl/workbook.xml"), rels = await read("xl/_rels/workbook.xml.rels");
  if (wb && rels) { const s = P.parseFromString(wb, "application/xml").getElementsByTagName("sheet")[0]; const rid = s && (s.getAttribute("r:id") || s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id")); for (const el of Array.from(P.parseFromString(rels, "application/xml").getElementsByTagName("Relationship"))) if (el.getAttribute("Id") === rid) { const t = el.getAttribute("Target") || ""; sheetPath = t.startsWith("/") ? t.slice(1) : "xl/" + t.replace(/^\.\//, ""); } }
  const strings = []; const sst = await read("xl/sharedStrings.xml");
  if (sst) for (const si of Array.from(P.parseFromString(sst, "application/xml").getElementsByTagName("si"))) strings.push(Array.from(si.getElementsByTagName("t")).map((t) => t.textContent).join(""));
  const sx = await read(sheetPath); if (!sx) throw Error("No worksheet found in the file.");
  const colIdx = (s) => s.split("").reduce((a, ch) => a * 26 + (ch.charCodeAt(0) - 64), 0) - 1; const rows = [];
  for (const r of Array.from(P.parseFromString(sx, "application/xml").getElementsByTagName("row"))) {
    const cells = [];
    for (const c of Array.from(r.getElementsByTagName("c"))) {
      const ref = (c.getAttribute("r") || "").replace(/\d+/g, ""); const col = ref ? colIdx(ref) : cells.length; const t = c.getAttribute("t"); const v = c.getElementsByTagName("v")[0];
      cells[col] = t === "s" ? (strings[Number(v && v.textContent)] || "") : t === "inlineStr" ? Array.from(c.getElementsByTagName("t")).map((x) => x.textContent).join("") : (v ? v.textContent : "");
    }
    const arr = Array.from(cells, (x) => (x == null ? "" : String(x))); if (arr.some((x) => x.trim() !== "")) rows.push(arr);
  }
  return rows;
}
const RL_MAX_ROWS = 2000, RL_MAX_FILE = 2 * 1024 * 1024;
function rlValidateRows(db, rows) {
  if (!rows.length) throw Error("The file is empty.");
  const head = rows[0].map((h) => String(h).trim().toLowerCase().replace(/[\s-]+/g, "_"));
  const col = (...names) => names.map((n) => head.indexOf(n)).find((i) => i >= 0);
  const ci = { name: col("name", "full_name", "student_name"), email: col("email", "email_id", "mail"), phone: col("phone", "phone_number", "mobile"), days: col("access_days", "days"), program: col("program", "programme"), status: col("status") };
  const missing = ["name", "email", "phone", "days"].filter((k) => ci[k] == null);
  if (missing.length) throw Error(`Missing required column(s): ${missing.map((k) => (k === "days" ? "access_days" : k)).join(", ")}. Required: name, email, phone, access_days.`);
  const body = rows.slice(1); if (body.length > RL_MAX_ROWS) throw Error(`Too many rows (${body.length}). Upload at most ${RL_MAX_ROWS} students per file.`);
  const seen = new Set(); const progMap = { "b.tech": "B.Tech", btech: "B.Tech", "m.tech": "M.Tech", mtech: "M.Tech", professional: "Working Professional", "working professional": "Working Professional", other: "Other" };
  return body.map((r, i) => {
    const g = (k) => (ci[k] == null ? "" : String(r[ci[k]] ?? "").trim());
    const out = { line: i + 2, name: g("name"), email: g("email").toLowerCase(), phone: g("phone"), days: g("days"), program: g("program") || "B.Tech", status: g("status") || "Active" };
    const fail = (reason) => ({ ...out, action: "failed", reason });
    if (!out.name) return fail("Name is empty");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(out.email)) return fail("Invalid email");
    if (!/^\+?\d{10,15}$/.test(out.phone.replace(/[\s().-]/g, ""))) return fail("Invalid phone (10–15 digits)");
    const d = Number(out.days); if (!Number.isInteger(d) || d < 1 || d > 730) return fail("access_days must be a whole number from 1 to 730");
    out.days = d; const pg = progMap[out.program.toLowerCase()]; if (!pg) return fail(`Unknown program "${out.program}"`); out.program = pg;
    const st = out.status.charAt(0).toUpperCase() + out.status.slice(1).toLowerCase(); if (!["Active", "Pending"].includes(st)) return fail("status must be Active or Pending"); out.status = st;
    if (seen.has(out.email)) return { ...out, action: "skipped", reason: "Duplicate email in this file" }; seen.add(out.email);
    const ex = db.users.find((u) => (u.email || "").toLowerCase() === out.email);
    if (ex && ex.role !== "student") return fail("Email belongs to an admin account");
    return { ...out, action: ex ? "update" : "create", reason: ex ? "Existing CAEE account — lab access added" : "New lab account + one-time password" };
  });
}
// image sources: plain URL, or "store:<key>" for files uploaded through the admin panel
function useRlImg(src) {
  const [url, setUrl] = useState(src && !String(src).startsWith("store:") ? src : "");
  useEffect(() => { let live = true; if (!src) { setUrl(""); return; } if (!String(src).startsWith("store:")) { setUrl(src); return; } (async () => { try { const r = await window.storage.get(String(src).slice(6), true); if (live) setUrl((r && r.value) || ""); } catch (e) { if (live) setUrl(""); } })(); return () => { live = false; }; }, [src]);
  return url;
}
function RlImg({ src, alt, style, className }) { const url = useRlImg(src); const [bad, setBad] = useState(false); useEffect(() => setBad(false), [url]); if (!url || bad) return null; return <img src={url} alt={alt} style={style} className={className} onError={() => setBad(true)} />; }
// Live hardware status only when a real status endpoint is configured; otherwise nothing is claimed.
/* ---------- front-page band (big, sits under the hero) ---------- */
function RemoteLabHomeBand({ db, setView }) {
  const rl = rlOf(db); const s = rl.settings; if (!s.publicPage || !s.homeSection) return null;
  const go = (anchor) => { window.__rlScroll = anchor || null; setView("remotelab"); };
  return (<section className="hr-b rl-band"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 64, paddingBottom: 64 }}>
    <div className="grid md:grid-cols-2 gap-10" style={{ alignItems: "center" }}>
      <div>
        <div className="pill pill-gold" style={{ marginBottom: 14 }}><Cpu size={13} /> NEW · STM32 REMOTE LAB</div>
        <h2 className="disp head rl-bigtitle">Remote Automotive<br />Engineering Lab</h2>
        <p className="ink" style={{ marginTop: 16, fontSize: "1.05rem", lineHeight: 1.65, maxWidth: 560 }}>Your code, running on <b>real STM32 NUCLEO-G474RE boards</b> in the CAEE lab, over real CAN networks, straight from your browser. No board to buy.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>{["13 Automotive ECU projects", "Real CAN-A + CAN-B networks", "Automated hardware scoring"].map((t) => <span key={t} className="pill pill-green" style={{ fontSize: 12, padding: ".3rem .7rem" }}><CheckCircle2 size={12} /> {t}</span>)}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}><Btn kind="cta" onClick={() => go()}>Explore the Remote Lab <ChevronRight size={16} /></Btn><Btn kind="ghost" onClick={() => go("rl-request")}>Request lab access</Btn></div>
      </div>
      <div className="card" style={{ padding: 8, overflow: "hidden" }}><RlImg src={s.media.dashboard} alt="Remote lab student workspace — concept preview" style={{ width: "100%", display: "block", borderRadius: 12 }} /><div className="faint" style={{ fontSize: 11, padding: "8px 6px 2px" }}>Concept preview of the student workspace</div></div>
    </div>
  </div></section>);
}

/* ---------- public Remote Lab page ---------- */
function RemoteLabPage({ db, commit, setView, flash, session }) {
  const rl = rlOf(db); const s = rl.settings; const live = useRlStatus(rlStatusUrl(db, s));
  const projects = rl.projects.filter((p) => p.enabled !== false);
  const [f, setF] = useState({ name: "", email: "", phone: "", program: "B.Tech", message: "", website: "" }); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  useEffect(() => { const a = window.__rlScroll; window.__rlScroll = null; setTimeout(() => { if (a) { const el = document.getElementById(a); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); } else window.scrollTo(0, 0); }, 60); }, []);
  const toRequest = () => { const el = document.getElementById("rl-request"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const isStudent = session && session.role === "student";
  const submit = () => {
    if (f.website) { setSent(true); return; } // bots fill the hidden field
    const name = f.name.trim(), email = f.email.trim().toLowerCase(), phone = f.phone.trim();
    if (!name || !email || !phone) return flash("Name, email and phone are required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return flash("Enter a valid email");
    if (!/^\+?\d{10,15}$/.test(phone.replace(/[\s().-]/g, ""))) return flash("Enter a valid phone number");
    if (rl.requests.some((r) => r.email === email && r.status === "pending")) { setSent(true); return; }
    setBusy(true);
    const req = { id: uid(), name: name.slice(0, 120), email: email.slice(0, 160), phone: phone.slice(0, 24), program: RL_PROGRAMS.includes(f.program) ? f.program : "Other", message: f.message.trim().slice(0, 1200), at: NOW(), status: "pending" };
    commit(rlPatch(db, { requests: [req, ...rl.requests].slice(0, 1000) })); setSent(true); setBusy(false);
  };
  const flow = [[FileCode, "Write", "Edit the project's C files in the browser workspace."], [ShieldCheck, "Check & build", "Safety checks and an isolated cloud build — errors come back with line numbers."], [ListOrdered, "Queue", "A fair queue hands your validated build to the next free hardware station."], [Cpu, "Run on hardware", "Flashed to the student NUCLEO-G474RE; a protected simulator ECU drives CAN-A / CAN-B."], [BarChart3, "Score & diagnose", "Measured CAN traffic is scored automatically, with clear diagnostics."]];
  return (<div>
    <section className="hero-dark hr-b"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 64, paddingBottom: 72 }}>
      <BackLink onClick={() => setView("public")} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 14, marginBottom: 18 }}><span className="pill pill-gold"><CarFront size={13} /> REMOTE HARDWARE · REAL STM32 · REAL CAN</span>{live && live.online > 0 && <span className="pill" style={{ background: "rgba(31,199,164,.16)", color: "#7fe3cc" }}><span className="rl-dot" style={{ background: live.online ? "#1fc7a4" : "#e8b84b" }} /> {live.online} of {live.total} hardware station{live.total === 1 ? "" : "s"} online</span>}</div>
      <h1 className="disp head rl-herotitle">{s.heroTitle}</h1>
      <p className="muted" style={{ marginTop: 20, maxWidth: 680, fontSize: "1.1rem", lineHeight: 1.65 }}>{s.heroSub}</p>
      <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}><Btn kind="cta" onClick={toRequest}>Request lab access <ChevronRight size={16} /></Btn>{isStudent ? <Btn kind="ghost" onClick={() => setView("rlab")}><Cpu size={15} /> Open my Remote Lab</Btn> : !session && <Btn kind="ghost" onClick={() => setView("login")}><LogIn size={15} /> Sign in</Btn>}</div>
      {s.launchNote && <div className="note" style={{ marginTop: 18, display: "inline-flex", gap: 8, alignItems: "center", background: "rgba(232,184,75,.14)", color: "#f1d48c" }}><CalendarClock size={14} /> {s.launchNote}</div>}
      <div className="stat-grid grid-cols-2 sm:grid-cols-4" style={{ marginTop: 44 }}>{[[String(projects.length), "Automotive ECU engineering projects"], ["G474RE", "Physical STM32 NUCLEO execution"], ["2× CAN", "CAN-A vehicle bus + CAN-B gateway bus"], ["0 boards", "to buy — everything runs in our lab"]].map(([k, v]) => (<div className="stat-cell" key={v}><div className="disp c-green" style={{ fontSize: "1.8rem", fontWeight: 800 }}>{k}</div><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{v}</div></div>))}</div>
    </div></section>

    <section className="max-w-6xl mx-auto px-5" style={{ paddingTop: 64, paddingBottom: 40 }}><SectionTitle icon={Workflow} k="How it works" t="Code. Check. Run. Measure. Prove." />
      <div className="rl-flow">{flow.map(([Ic, t, d], i) => (<div key={t} className="step"><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><div className="stepnum">{i + 1}</div><Ic size={18} className="c-teal" /></div><div className="disp head" style={{ fontWeight: 700, fontSize: ".95rem" }}>{t}</div><div className="muted" style={{ fontSize: ".82rem", lineHeight: 1.5, marginTop: 4 }}>{d}</div></div>))}</div>
    </section>

    <section className="max-w-6xl mx-auto px-5" style={{ paddingBottom: 56 }}><div className="grid md:grid-cols-2 gap-8" style={{ alignItems: "center" }}>
      <div><SectionTitle icon={Network} k="The bench" t="One real vehicle network, many ECU roles" /><p className="ink" style={{ fontSize: ".95rem", lineHeight: 1.7 }}>Each lab station pairs your <b>Student ECU</b> with a protected <b>Vehicle Simulator ECU</b> — both STM32 NUCLEO-G474RE boards — on two physical CAN buses. The simulator plays the rest of the car: engine, brakes, BCM, battery and gateway traffic. Your firmware is flashed only to the student board; the simulator never accepts student code.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>{[[ShieldCheck, "Hard time limit on every run, independent of your code"], [RefreshCw, "Automatic reset and health check after every run"], [Radio, "CAN ID and frame-rate limits per project"]].map(([Ic, t]) => <div key={t} className="ink" style={{ display: "flex", gap: 10, alignItems: "center", fontSize: ".88rem" }}><Ic size={16} className="c-teal" /> {t}</div>)}</div></div>
      <RlBenchDiagram />
    </div></section>

    {s.media.dashboard && (<section className="bg2 hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 56, paddingBottom: 56 }}><div className="grid md:grid-cols-5 gap-8" style={{ alignItems: "center" }}><div className="md:col-span-2"><SectionTitle icon={Monitor} k="Student workspace" t="Everything in one engineering console" /><p className="ink" style={{ fontSize: ".95rem", lineHeight: 1.7 }}>Code editor, vehicle scenario, live CAN monitor, hardware status, build and run output, and automated scoring — side by side.</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>{["Cloud compilation", "ST-LINK flashing", "Live CAN frames", "Run history", "Project progress", "Hardware scoring"].map((t) => <span key={t} className="pill pill-green">{t}</span>)}</div></div><div className="md:col-span-3 card" style={{ padding: 8, overflow: "hidden" }}><RlImg src={s.media.dashboard} alt="Remote lab student workspace — concept preview" style={{ width: "100%", display: "block", borderRadius: 12 }} /><div className="faint" style={{ fontSize: 11, padding: "8px 6px 2px" }}>Concept preview — the live workspace may differ.</div></div></div></div></section>)}

    <section className="max-w-6xl mx-auto px-5" style={{ paddingTop: 64, paddingBottom: 64 }}><SectionTitle icon={FolderKanban} k="Project-based learning" t={`${projects.length} Automotive ECU Engineering Projects`} />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">{projects.map((p, i) => (<div key={p.id} className="card rl-proj"><div className="mono c-green" style={{ fontSize: 12, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</div><div className="disp head" style={{ fontWeight: 700, fontSize: "1rem", marginTop: 6 }}>{p.title}</div><div className="muted" style={{ fontSize: ".85rem", lineHeight: 1.5, marginTop: 6, flex: 1 }}>{p.desc}</div><span className="pill pill-gold" style={{ marginTop: 12, alignSelf: "flex-start" }}><Cpu size={11} /> Hardware validation project</span></div>))}</div>
    </section>

    <RlMediaBand s={s} />

    <section id="rl-request" className="bg2 hr-b divider-t"><div className="max-w-6xl mx-auto px-5" style={{ paddingTop: 64, paddingBottom: 64 }}><div className="grid md:grid-cols-2 gap-10">
      <div><SectionTitle icon={KeyRound} k="Controlled access" t="Get access to the lab" />
        <p className="ink" style={{ fontSize: ".95rem", lineHeight: 1.7 }}>Already in a CAEE B.Tech or M.Tech internship? Sign in with your existing account — your access is added to it, no new account needed. Everyone else: send a request and we'll set you up with a time-bound lab account.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>{[["01", "Request or enrolment", "Through this form, or your CAEE programme"], ["02", "Approval", "CAEE reviews and sets your access period"], ["03", "One-time password", "Activate your account and set your own password"], ["04", "Time-bound access", "Runs for your approved number of days"]].map(([n, t, d]) => (<div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><span className="mono c-green" style={{ fontSize: 12, fontWeight: 700, width: 22 }}>{n}</span><div><div className="head" style={{ fontWeight: 600, fontSize: ".9rem" }}>{t}</div><div className="muted" style={{ fontSize: ".82rem" }}>{d}</div></div></div>))}</div>
        {!session && <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}><Btn kind="ghost" onClick={() => setView("login")}><LogIn size={15} /> Sign in</Btn><Btn kind="ghost" onClick={() => setView("activate")}><KeyRound size={15} /> I have a one-time password</Btn></div>}
      </div>
      <Card style={{ padding: 24 }}>{sent ? (<div style={{ textAlign: "center", padding: "24px 6px" }}><CheckCircle2 size={44} className="c-pass" style={{ margin: "0 auto 14px" }} /><div className="disp head" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Request received</div><p className="muted" style={{ fontSize: ".9rem", marginTop: 8, lineHeight: 1.6 }}>Thanks — the CAEE team will review it and email you. If you're approved you'll receive a one-time password to activate your lab account.</p></div>) : (<>
        <div className="disp head" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 14 }}>Request Remote Lab access</div>
        <div className="grid sm:grid-cols-2 gap-3"><Field label="Full name" value={f.name} onChange={set("name")} placeholder="Your name" /><Field label="Email" value={f.email} onChange={set("email")} placeholder="you@gmail.com" /><Field label="Phone" value={f.phone} onChange={set("phone")} placeholder="+91…" /><label style={{ display: "block", marginBottom: 12 }}><span className="lbl">Program</span><select className="sel" value={f.program} onChange={set("program")}>{RL_PROGRAMS.map((p) => <option key={p}>{p}</option>)}</select></label></div>
        <Area label="Why do you want access?" rows={3} value={f.message} onChange={set("message")} placeholder="What you want to build or learn…" />
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
        <Btn kind="cta" onClick={submit} disabled={busy}>Send access request <ChevronRight size={15} /></Btn>
      </>)}</Card>
    </div></div></section>
    <Footer setView={setView} />
  </div>);
}
function RlMediaBand({ s }) {
  const slots = [["rack", "The office remote-lab rack"], ["bench", "STM32 + CAN hardware"], ["run", "A student hardware run"]].filter(([k]) => s.media[k]);
  if (!slots.length && !s.media.video) return null;
  return (<section className="max-w-6xl mx-auto px-5" style={{ paddingTop: 56, paddingBottom: 56 }}><SectionTitle icon={ImageIcon} k="Inside the lab" t="Real hardware, real proof" />
    {s.media.video && <Card style={{ padding: 10, maxWidth: 860, marginBottom: 18 }}><VideoEmbed url={s.media.video} height={420} /></Card>}
    {slots.length > 0 && <div className="grid sm:grid-cols-3 gap-5">{slots.map(([k, t]) => (<Card key={k} style={{ overflow: "hidden" }}><RlImg src={s.media[k]} alt={t} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} /><div className="disp head" style={{ padding: 14, fontWeight: 600, fontSize: ".9rem" }}>{t}</div></Card>))}</div>}
  </section>);
}
function RlBenchDiagram() {
  const box = (title, sub, accent) => (<div className="rl-node" style={accent ? { borderColor: "var(--green)", boxShadow: "0 0 0 3px rgba(0,183,217,.12)" } : null}><div className="disp head" style={{ fontWeight: 700, fontSize: ".86rem" }}>{title}</div><div className="faint" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div></div>);
  return (<div className="card" style={{ padding: 18 }} role="img" aria-label="Lab bench: the CAEE cloud sends validated builds to the office Lab Agent, which flashes the Student ECU over ST-LINK. The Student ECU and the Vehicle Simulator ECU are connected by CAN-A and CAN-B.">
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {box("CAEE cloud", "Build · safety checks · queue · scoring")}
      <div className="rl-wire-v" /><div className="faint mono" style={{ fontSize: 10 }}>outbound TLS only</div><div className="rl-wire-v" />
      {box("Office Lab Agent", "ST-LINK serial-bound flashing + recovery")}
      <div className="rl-wire-v" />
    </div>
    <div className="rl-bench">
      {box("Student ECU", "NUCLEO-G474RE · your firmware", true)}
      <div className="rl-buses"><div className="rl-bus"><span>CAN-A · vehicle bus</span></div><div className="rl-bus rl-bus-b"><span>CAN-B · gateway bus</span></div></div>
      {box("Vehicle Simulator ECU", "NUCLEO-G474RE · protected")}
    </div>
  </div>);
}

/* ---------- student workspace ---------- */
/* ---------- Super Admin: STM32 Lab Settings ---------- */
const RL_SECTIONS = [["overview", "Overview", LayoutDashboard], ["students", "Student Access", Users], ["bulk", "Bulk Enrollment", FileSpreadsheet], ["programs", "Program Entitlements", BadgeCheck], ["requests", "Access Requests", Inbox], ["projects", "Project Analytics", BarChart3], ["runs", "Program & Run History", HistoryIcon], ["scheduler", "Job Scheduler", ListOrdered], ["safety", "Safety & Execution Policy", ShieldAlert], ["infra", "Lab Infrastructure", Server], ["content", "Content & Media", ImageIcon], ["integration", "Integration Settings", Settings2]];
function RemoteLabAdmin({ db, commit, flash, who }) {
  const [sec, setSec] = useState("overview"); const [otps, setOtps] = useState([]);
  const rl = rlOf(db); const pendingReq = rl.requests.filter((r) => r.status === "pending").length;
  const showOtp = (list) => setOtps(list.filter((x) => x && x.otp));
  const props = { db, commit, flash, who, rl, showOtp, go: setSec };
  return (<div>
    <div style={{ marginBottom: 16 }}><div className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>STM32 Remote Automotive Engineering Lab</div><div className="disp head" style={{ fontSize: "1.25rem", fontWeight: 700 }}>{(RL_SECTIONS.find((x) => x[0] === sec) || [])[1]}</div></div>
    <div className="rl-shell">
      <nav className="rl-nav" aria-label="STM32 lab sections">{RL_SECTIONS.map(([k, label, Ic]) => (<button key={k} className={`rl-navbtn ${sec === k ? "on" : ""}`} onClick={() => setSec(k)}><Ic size={15} /> <span>{label}</span>{k === "requests" && pendingReq > 0 && <span className="rl-count">{pendingReq}</span>}</button>))}</nav>
      <div style={{ minWidth: 0 }}>
        {otps.length > 0 && <RlOtpCard list={otps} flash={flash} onClose={() => setOtps([])} />}
        {sec === "overview" && <RlOverview {...props} />}
        {sec === "students" && <RlStudents {...props} />}
        {sec === "bulk" && <RlBulk {...props} />}
        {sec === "programs" && <RlPrograms {...props} />}
        {sec === "requests" && <RlRequests {...props} />}
        {sec === "projects" && <RlProjects {...props} />}
        {sec === "runs" && <RlRuns {...props} />}
        {sec === "scheduler" && <RlScheduler {...props} />}
        {sec === "safety" && <RlSafety {...props} />}
        {sec === "infra" && <RlInfra {...props} />}
        {sec === "content" && <RlContent {...props} />}
        {sec === "integration" && <RlIntegration {...props} />}
      </div>
    </div>
  </div>);
}
function RlOtpCard({ list, flash, onClose }) {
  const dl = () => exportCSV(["Name", "Email", "One-time password"], list.map((x) => [x.name, x.email, x.otp]), "caee-remote-lab-otps.csv");
  return (<Card style={{ padding: 16, marginBottom: 16, background: "rgba(43,166,101,.08)", borderColor: "var(--green)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}><div><div className="disp head" style={{ fontWeight: 700, fontSize: ".92rem" }}><KeyRound size={14} style={{ verticalAlign: "-2px" }} /> One-time password{list.length > 1 ? `s (${list.length})` : ""} — send to the student{list.length > 1 ? "s" : ""}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>They open <b>Sign in → First time? Activate with your one-time password</b> (or the button on the Remote Lab page), enter it and set their own password. Press <b>Save changes</b> first so the accounts go live.</div></div><button className="iconbtn" onClick={onClose} aria-label="Close"><X size={14} /></button></div>
    {list.length === 1 ? (<div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}><span className="ink" style={{ fontSize: ".85rem" }}>{list[0].name} · {list[0].email}</span><span className="mono" style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: 3, color: "var(--green-d)" }}>{list[0].otp}</span><Btn sm kind="ghost" onClick={() => { try { navigator.clipboard.writeText(list[0].otp); flash("Copied"); } catch (e) {} }}><Copy size={13} /> Copy</Btn></div>) : (<div style={{ marginTop: 10 }}><Btn sm onClick={dl}><Download size={13} /> Download one-time passwords (CSV)</Btn><span className="faint" style={{ fontSize: 11, marginLeft: 8 }}>Shown once — download before closing.</span></div>)}
  </Card>);
}
const RlKpi = ({ label, value, sub, warn }) => (<div className="tile"><div className="lbl">{label}</div><div className={`disp ${warn ? "c-gold" : "head"}`} style={{ fontSize: "1.6rem", fontWeight: 800 }}>{value}</div>{sub && <div className="faint" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>}</div>);
const RlPanel = ({ title, sub, right, children, pad = 16 }) => (<Card style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}><div className="divider" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}><div><div className="disp head" style={{ fontWeight: 700, fontSize: ".95rem" }}>{title}</div>{sub && <div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>{sub}</div>}</div>{right}</div><div style={{ padding: pad }}>{children}</div></Card>);
const RlRow = ({ k, v, tone }) => (<div className="divider" style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", fontSize: ".84rem" }}><span className="muted">{k}</span><b className={tone === "ok" ? "c-pass" : tone === "warn" ? "c-gold" : tone === "bad" ? "c-fail" : "ink"} style={{ textAlign: "right" }}>{v}</b></div>);
function rlStudentsOf(db) { return db.users.filter((u) => u.role === "student"); }
function rlRunStats(jobs, filter) { const runs = (jobs || []).filter((j) => j.result === "PASSED" || j.result === "FAILED").filter(filter || (() => true)); const pass = runs.filter((r) => r.result === "PASSED").length; return { n: runs.length, pass, rate: runs.length ? Math.round((pass / runs.length) * 100) : null, runs }; }

function RlStudents({ db, commit, flash, who, rl, showOtp }) {
  const hwData = useRlAdminHw(db, 30000).data; const hwJobs = (hwData && hwData.jobs) || [];
  const [qy, setQy] = useState(""); const [flt, setFlt] = useState("lab"); const [edit, setEdit] = useState(null); const [showAdd, setShowAdd] = useState(false);
  const blank = { name: "", email: "", phone: "", program: "B.Tech", days: rl.settings.defaultDays, status: "Active", issueOtp: true }; const [f, setF] = useState(blank);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const all = rlStudentsOf(db).map((u) => ({ u, a: rlAccess(db, u) }));
  const list = all.filter(({ u, a }) => (flt === "all" || (flt === "lab" ? (a.status !== "None" || u.labOnly) : a.status === flt)) && (u.name + " " + u.email + " " + (u.phone || "")).toLowerCase().includes(qy.toLowerCase()));
  const ents = rl.entitlements;
  const setEnt = (u, patch, msg) => { const cur = ents[u.id] || { program: rlProgOf(u), source: "Individual", startAt: NOW() }; commit({ ...rlPatch(db, { entitlements: { ...ents, [u.id]: { ...cur, ...patch, by: who, at: NOW() } } }), audit: auditPush(db, `Remote lab: ${msg} · ${u.name}`, who) }); };
  const grant = (u, days) => setEnt(u, { status: "Active", startAt: NOW(), expiresAt: new Date(Date.now() + days * RL_DAY).toISOString() }, `granted ${days} days`);
  const removeOverride = (u) => { const { [u.id]: _x, ...rest } = ents; commit({ ...rlPatch(db, { entitlements: rest }), audit: auditPush(db, `Remote lab: individual access removed · ${u.name}`, who) }); };
  const issueOtp = (u) => { const otp = rlOtp(); commit({ ...db, users: db.users.map((x) => x.id === u.id ? { ...x, password: otp, mustSetPassword: true } : x), audit: auditPush(db, `Remote lab: issued one-time password · ${u.name}`, who) }); showOtp([{ name: u.name, email: u.email, otp }]); };
  const add = () => {
    const email = f.email.trim().toLowerCase(); const d = Number(f.days);
    if (!f.name.trim() || !email || !f.phone.trim()) return flash("Name, email and phone are required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return flash("Enter a valid email");
    if (!/^\+?\d{10,15}$/.test(f.phone.replace(/[\s().-]/g, ""))) return flash("Enter a valid phone number");
    if (!Number.isInteger(d) || d < 1 || d > 730) return flash("Access days must be 1–730");
    const r = rlProvision(db, { ...f, email, days: d }, who, "Individual"); if (r.result === "failed") return flash(r.reason);
    commit({ ...r.db, audit: auditPush(db, `Remote lab: ${r.result === "created" ? "created lab account" : "added lab access to existing account"} (${d} days) · ${f.name.trim()}`, who) });
    if (r.otp) showOtp([{ name: r.user.name, email: r.user.email, otp: r.otp }]);
    flash(r.result === "created" ? "Lab account created" : "Existing account found — lab access added (no duplicate account)"); setF(blank); setShowAdd(false);
  };
  const csv = () => exportCSV(["Name", "Email", "Phone", "Program", "Source", "Status", "Days left", "Hardware runs", "Pass rate"], list.map(({ u, a }) => { const st = rlRunStats(hwJobs, (r) => r.user_id === u.id); return [u.name, u.email, u.phone || "", rlProgOf(u), a.source || "", a.status, a.days ?? "", st.n, st.rate == null ? "" : st.rate + "%"]; }), "caee-remote-lab-students.csv");
  return (<div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
      <div style={{ position: "relative", flex: 1, minWidth: 200 }}><Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} /><input className="input has-ic" placeholder="Search name, email or phone" value={qy} onChange={(e) => setQy(e.target.value)} /></div>
      <select className="sel" style={{ width: "auto" }} value={flt} onChange={(e) => setFlt(e.target.value)}><option value="lab">With lab access / records</option><option value="Active">Active</option><option value="Pending">Pending</option><option value="Suspended">Suspended</option><option value="Expired">Expired</option><option value="None">No lab access</option><option value="all">All students</option></select>
      <Btn kind="ghost" onClick={csv}><Download size={14} /> CSV</Btn><Btn onClick={() => setShowAdd(!showAdd)}><UserPlus size={15} /> Add student</Btn>
    </div>
    {showAdd && (<Card style={{ padding: 18, marginBottom: 16 }}><div className="disp head" style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 10 }}>Add individual student</div>
      <div className="grid sm:grid-cols-3 gap-3"><Field label="Name" value={f.name} onChange={set("name")} /><Field label="Email" value={f.email} onChange={set("email")} /><Field label="Phone" value={f.phone} onChange={set("phone")} />
        <label style={{ display: "block", marginBottom: 12 }}><span className="lbl">Program</span><select className="sel" value={f.program} onChange={set("program")}>{RL_PROGRAMS.map((p) => <option key={p}>{p}</option>)}</select></label>
        <Field label="Access days" type="number" min="1" max="730" value={f.days} onChange={set("days")} />
        <label style={{ display: "block", marginBottom: 12 }}><span className="lbl">Initial status</span><select className="sel" value={f.status} onChange={set("status")}><option>Active</option><option>Pending</option></select></label></div>
      <label className="ink" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: ".84rem", marginBottom: 12 }}><input type="checkbox" checked={f.issueOtp} onChange={set("issueOtp")} /> Issue a one-time password for first login (always issued for new accounts)</label>
      <p className="faint" style={{ fontSize: 11, marginBottom: 10 }}>If the email already belongs to a CAEE student, lab access is added to that account — no duplicate account is created.</p>
      <div style={{ display: "flex", gap: 8 }}><Btn onClick={add}><Plus size={15} /> Create access</Btn><Btn kind="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn></div></Card>)}
    {list.length === 0 ? <Empty msg={flt === "lab" ? "No students have Remote Lab access yet. Add one, upload a cohort, approve a request or switch on programme access." : "No students match."} /> : (<Card style={{ padding: 0, overflow: "hidden" }}><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Student</th><th>Program</th><th>Source</th><th>Status</th><th>Days left</th><th>Projects passed</th><th>Pass rate</th><th>Last run</th><th>Actions</th></tr></thead><tbody>{list.map(({ u, a }) => { const st = rlRunStats(hwJobs, (r) => r.user_id === u.id); const passedP = new Set(st.runs.filter((r) => r.result === "PASSED").map((r) => r.project_id)).size; const last = st.runs.map((r) => r.completed_at).filter(Boolean).sort().pop(); const e = ents[u.id]; const editing = edit && edit.id === u.id; return (<React.Fragment key={u.id}><tr>
      <td><div className="head" style={{ fontWeight: 600 }}>{u.name}{u.labOnly && <span className="pill pill-gold" style={{ marginLeft: 6, fontSize: 9.5 }}>LAB ONLY</span>}</div><div className="faint" style={{ fontSize: 11 }}>{u.email}<br />{u.phone || "—"}</div></td>
      <td>{rlProgOf(u)}</td><td className="muted">{a.source || "—"}</td><td><RlStatus st={a.status} /></td><td className="mono">{a.days ?? "—"}</td><td className="mono">{passedP}/{rl.projects.length}</td><td className="mono">{st.rate == null ? "—" : st.rate + "%"}</td><td className="muted">{last ? new Date(last).toLocaleDateString("en-IN") : "—"}</td>
      <td><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {a.status === "None" ? <Btn sm onClick={() => grant(u, Number(rl.settings.defaultDays) || 90)}><Plus size={12} /> Grant {rl.settings.defaultDays}d</Btn> : <Btn sm kind="ghost" onClick={() => setEdit(editing ? null : { id: u.id, days: a.days ?? rl.settings.defaultDays, status: e ? (a.status === "Scheduled" ? "Active" : a.status) : "Active" })}><Edit3 size={12} /> Edit</Btn>}
        {a.status === "Active" && <Btn sm kind="ghost" onClick={() => setEnt(u, { status: "Suspended", expiresAt: e?.expiresAt || (a.days != null ? new Date(Date.now() + a.days * RL_DAY).toISOString() : null) }, "suspended")}><Ban size={12} /> Suspend</Btn>}
        {a.status === "Suspended" && <Btn sm kind="good" onClick={() => setEnt(u, { status: "Active" }, "reactivated")}><RefreshCw size={12} /> Reactivate</Btn>}
        {(a.status === "Active" || a.status === "Pending") && <Btn sm kind="danger" onClick={() => setEnt(u, { status: "Expired", expiresAt: NOW() }, "expired immediately")}><X size={12} /> Expire now</Btn>}
        <button className="iconbtn" style={{ width: 28, height: 28 }} title="Issue one-time password" onClick={() => issueOtp(u)}><KeyRound size={13} /></button>
        {e && !u.labOnly && <button className="iconbtn" style={{ width: 28, height: 28 }} title="Remove individual override (fall back to programme rule)" onClick={() => removeOverride(u)}><Undo2 size={13} /></button>}
      </div></td></tr>
      {editing && (<tr><td colSpan={9} style={{ background: "var(--tint)" }}><div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}><div style={{ width: 150 }}><span className="lbl">Access days from today</span><input className="input" type="number" min="0" max="730" value={edit.days} onChange={(ev) => setEdit({ ...edit, days: ev.target.value })} /></div><div style={{ width: 160 }}><span className="lbl">Status</span><select className="sel" value={edit.status} onChange={(ev) => setEdit({ ...edit, status: ev.target.value })}>{RL_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div><Btn sm onClick={() => { const d = Number(edit.days); if (!Number.isInteger(d) || d < 0 || d > 730) return flash("Days must be 0–730"); setEnt(u, { status: edit.status, expiresAt: new Date(Date.now() + d * RL_DAY).toISOString() }, `set to ${edit.status}, ${d} days`); setEdit(null); }}><Save size={12} /> Save</Btn><Btn sm kind="ghost" onClick={() => setEdit(null)}>Cancel</Btn>{a.source === "Program" && !e && <span className="faint" style={{ fontSize: 11 }}>Saving creates an individual override for this student.</span>}</div></td></tr>)}
    </React.Fragment>); })}</tbody></table></div></Card>)}
    <p className="faint" style={{ fontSize: 11, marginTop: 10 }}>Program = access from the B.Tech/M.Tech programme rule (follows the course period). Individual = set here, by bulk upload or by an approved request; it overrides the programme rule.</p>
  </div>);
}

function RlBulk({ db, commit, flash, who, rl, showOtp }) {
  const [rows, setRows] = useState(null); const [err, setErr] = useState(""); const [fname, setFname] = useState(""); const [report, setReport] = useState(null); const [busy, setBusy] = useState(false);
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0]; e.target.value = ""; if (!file) return; setErr(""); setRows(null); setReport(null); setFname(file.name);
    try {
      if (file.size > RL_MAX_FILE) throw Error("File is larger than 2 MB. Split the cohort into smaller files.");
      const ext = file.name.toLowerCase().split(".").pop(); let table;
      if (ext === "csv") table = rlParseCsv(await file.text()); else if (ext === "xlsx") table = await rlReadXlsx(await file.arrayBuffer()); else if (ext === "xls") throw Error("Old .xls format: open it in Excel and save as .xlsx or CSV, then upload again."); else throw Error("Upload a .xlsx or .csv file.");
      setRows(rlValidateRows(db, table));
    } catch (x) { setErr(x.message || String(x)); }
  };
  const counts = rows ? rows.reduce((m, r) => ({ ...m, [r.action]: (m[r.action] || 0) + 1 }), {}) : {};
  const apply = () => {
    if (!rows) return; setBusy(true); let cur = db; const out = []; const otpList = [];
    for (const r of rows) {
      if (r.action !== "create" && r.action !== "update") { out.push({ ...r, result: r.action === "skipped" ? "skipped" : "failed" }); continue; }
      const res = rlProvision(cur, { ...r, issueOtp: false }, who, "Bulk upload");
      if (res.result === "failed") { out.push({ ...r, result: "failed", reason: res.reason }); continue; }
      cur = res.db; out.push({ ...r, result: res.result }); if (res.otp) otpList.push({ name: res.user.name, email: res.user.email, otp: res.otp });
    }
    const c = out.reduce((m, r) => ({ ...m, [r.result]: (m[r.result] || 0) + 1 }), {});
    commit({ ...cur, audit: auditPush(db, `Remote lab bulk upload "${fname}": ${c.created || 0} created, ${c.updated || 0} updated, ${c.skipped || 0} skipped, ${c.failed || 0} failed`, who) });
    setReport({ rows: out, c }); setRows(null); showOtp(otpList); setBusy(false); flash("Cohort provisioned — press Save changes to make it live");
  };
  const template = () => { const csv = "name,email,phone,access_days,program,status\nSample Student,student@example.com,+91 9876543210,90,B.Tech,Active\n"; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "caee-remote-lab-students-template.csv"; a.click(); };
  const reportCsv = () => exportCSV(["Line", "Name", "Email", "Result", "Reason"], report.rows.map((r) => [r.line, r.name, r.email, r.result, r.reason || ""]), "caee-remote-lab-import-report.csv");
  const tone = (a) => ({ create: "b-pass", created: "b-pass", update: "b-sub", updated: "b-sub", skipped: "b-ns", failed: "b-fail" }[a]);
  return (<div>
    <div className="grid md:grid-cols-2 gap-4">
      <RlPanel title="Upload a cohort" sub="Excel (.xlsx) or CSV · up to 2,000 rows · 2 MB"><label className="upload"><Upload size={18} className="c-green" /><span className="muted" style={{ fontSize: ".875rem" }}>{fname && !report ? fname : "Click to choose your cohort file"}</span><input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} style={{ display: "none" }} /></label>{err && <div className="note" style={{ marginTop: 10, background: "var(--failbg)", color: "var(--fail)" }}><AlertCircle size={13} style={{ verticalAlign: "-2px" }} /> {err}</div>}</RlPanel>
      <RlPanel title="Required format" sub="First row must be the column names" right={<Btn sm kind="ghost" onClick={template}><Download size={13} /> Template</Btn>}><div className="code" style={{ maxHeight: "none" }}>name,email,phone,access_days,program,status{"\n"}Sample Student,student@example.com,+91 9876543210,90,B.Tech,Active</div><p className="faint" style={{ fontSize: 11, marginTop: 8 }}>Required: name, email, phone, access_days (1–730). Optional: program (B.Tech, M.Tech, Working Professional, Other), status (Active, Pending). Existing CAEE students are matched by email and get lab access added — no duplicates.</p></RlPanel>
    </div>
    {rows && (<RlPanel title={`Preview — ${rows.length} row${rows.length === 1 ? "" : "s"}`} sub={`${counts.create || 0} new · ${counts.update || 0} existing accounts · ${counts.skipped || 0} skipped · ${counts.failed || 0} with errors`} right={<div style={{ display: "flex", gap: 8 }}><Btn sm kind="ghost" onClick={() => setRows(null)}>Cancel</Btn><Btn sm onClick={apply} disabled={busy || !(counts.create || counts.update)}><Check size={13} /> Provision {(counts.create || 0) + (counts.update || 0)} student{(counts.create || 0) + (counts.update || 0) === 1 ? "" : "s"}</Btn></div>} pad={0}><div style={{ overflowX: "auto", maxHeight: 420 }}><table className="tbl"><thead><tr><th>Line</th><th>Name</th><th>Email</th><th>Phone</th><th>Days</th><th>Program</th><th>Status</th><th>Action</th><th>Note</th></tr></thead><tbody>{rows.map((r) => (<tr key={r.line}><td className="mono">{r.line}</td><td>{r.name}</td><td className="muted">{r.email}</td><td className="muted">{r.phone}</td><td className="mono">{String(r.days)}</td><td>{r.program}</td><td>{r.status}</td><td><span className={`badge ${tone(r.action)}`}>{r.action}</span></td><td className="faint" style={{ fontSize: 11 }}>{r.reason}</td></tr>))}</tbody></table></div></RlPanel>)}
    {report && (<RlPanel title="Import report" sub={`${report.c.created || 0} created · ${report.c.updated || 0} updated · ${report.c.skipped || 0} skipped · ${report.c.failed || 0} failed`} right={<Btn sm kind="ghost" onClick={reportCsv}><Download size={13} /> Report CSV</Btn>} pad={0}><div style={{ overflowX: "auto", maxHeight: 360 }}><table className="tbl"><thead><tr><th>Line</th><th>Name</th><th>Email</th><th>Result</th><th>Reason</th></tr></thead><tbody>{report.rows.map((r) => (<tr key={r.line}><td className="mono">{r.line}</td><td>{r.name}</td><td className="muted">{r.email}</td><td><span className={`badge ${tone(r.result)}`}>{r.result}</span></td><td className="faint" style={{ fontSize: 11 }}>{r.result === "failed" || r.result === "skipped" ? r.reason : ""}</td></tr>))}</tbody></table></div></RlPanel>)}
  </div>);
}

function RlPrograms({ db, commit, who, rl }) {
  const s = rl.settings; const studs = rlStudentsOf(db);
  const toggle = (t) => { const on = !s.programAccess[t].on; commit({ ...rlSettings(db, { programAccess: { ...s.programAccess, [t]: { ...s.programAccess[t], on } } }), audit: auditPush(db, `Remote lab: ${TRACK[t].tag} programme access ${on ? "ON" : "OFF"}`, who) }); };
  return (<div>
    <div className="grid md:grid-cols-2 gap-4">{["btech", "mtech"].map((t) => { const on = s.programAccess[t].on; const n = studs.filter((u) => u.track === t && u.access && !u.labOnly).length; return (<Card key={t} style={{ padding: 18, borderColor: on ? "var(--green)" : undefined }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><div><div className="disp head" style={{ fontWeight: 700 }}>{TRACK[t].tag} Remote Lab</div><div className="mono faint" style={{ fontSize: 11 }}>{t === "btech" ? "BTECH_REMOTE_LAB" : "MTECH_REMOTE_LAB"}</div></div><button className={`toggle ${on ? "on" : ""}`} onClick={() => toggle(t)}><span className={`tickbox ${on ? "on" : ""}`}>{on && <Check size={11} color="#fff" />}</span>{on ? "ON" : "OFF"}</button></div><p className="muted" style={{ fontSize: ".84rem", marginTop: 10, lineHeight: 1.5 }}>When ON, every {TRACK[t].tag} student whose course access is <b>Allowed</b> gets the Remote Lab for the rest of their course period — using their existing account.</p><div className="faint" style={{ fontSize: 11, marginTop: 6 }}>{n} {TRACK[t].tag} student{n === 1 ? "" : "s"} currently allowed</div></Card>); })}</div>
    <RlPanel title="Defaults & rules">
      <div style={{ maxWidth: 260 }}><Field label="Default access days (individual, requests)" type="number" min="1" max="730" value={s.defaultDays} onChange={(e) => commit(rlSettings(db, { defaultDays: Math.max(1, Math.min(730, Number(e.target.value) || 1)) }))} /></div>
      <RlRow k="Working professionals / other" v="Individual or bulk only" /><RlRow k="Individual setting vs programme rule" v="Individual wins" /><RlRow k="Expired or suspended" v="No hardware jobs" /><RlRow k="Login" v="Same CAEE account" />
    </RlPanel>
  </div>);
}

function RlRequests({ db, commit, flash, who, rl, showOtp }) {
  const [days, setDays] = useState({}); const [showDone, setShowDone] = useState(false);
  const pend = rl.requests.filter((r) => r.status === "pending"); const done = rl.requests.filter((r) => r.status !== "pending");
  const mark = (cur, r, status) => rlPatch(cur, { requests: rlOf(cur).requests.map((x) => x.id === r.id ? { ...x, status, by: who, decidedAt: NOW() } : x) });
  const approve = (r) => { const d = Number(days[r.id] ?? rl.settings.defaultDays); if (!Number.isInteger(d) || d < 1 || d > 730) return flash("Days must be 1–730"); const res = rlProvision(db, { ...r, days: d, status: "Active" }, who, "Access request"); if (res.result === "failed") return flash(res.reason); commit({ ...mark(res.db, r, "approved"), audit: auditPush(db, `Remote lab: approved request (${d} days) · ${r.name}`, who) }); if (res.otp) showOtp([{ name: res.user.name, email: res.user.email, otp: res.otp }]); flash(res.result === "created" ? "Approved — lab account created" : "Approved — access added to the existing account"); };
  const decline = (r) => commit({ ...mark(db, r, "declined"), audit: auditPush(db, `Remote lab: declined request · ${r.name}`, who) });
  return (<div>
    {pend.length === 0 ? <Empty msg="No pending access requests." /> : (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{pend.map((r) => { const exists = db.users.some((u) => (u.email || "").toLowerCase() === r.email); return (<Card key={r.id} style={{ padding: 18 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div style={{ flex: 1, minWidth: 220 }}><div className="disp head" style={{ fontWeight: 700 }}>{r.name} <span className="pill pill-green" style={{ marginLeft: 6 }}>{r.program}</span>{exists && <span className="pill pill-gold" style={{ marginLeft: 6 }}>Existing CAEE account</span>}</div><div className="muted" style={{ fontSize: 12, marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap" }}><span><Mail size={12} style={{ verticalAlign: "-2px" }} /> {r.email}</span><span><Phone size={12} style={{ verticalAlign: "-2px" }} /> {r.phone}</span><span className="faint">{new Date(r.at).toLocaleString("en-IN")}</span></div>{r.message && <p className="note" style={{ marginTop: 10, fontStyle: "italic" }}>"{r.message}"</p>}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}><div style={{ width: 110 }}><span className="lbl">Days</span><input className="input" type="number" min="1" max="730" value={days[r.id] ?? rl.settings.defaultDays} onChange={(e) => setDays({ ...days, [r.id]: e.target.value })} /></div><Btn kind="good" onClick={() => approve(r)}><Check size={14} /> Approve</Btn><Btn kind="danger" onClick={() => decline(r)}><X size={14} /> Decline</Btn></div></div></Card>); })}</div>)}
    {done.length > 0 && (<div style={{ marginTop: 16 }}><button className="navlink" style={{ padding: 0 }} onClick={() => setShowDone(!showDone)}>{showDone ? "Hide" : "Show"} decided requests ({done.length})</button>{showDone && <Card style={{ padding: 0, marginTop: 8, overflow: "hidden" }}><div style={{ overflowX: "auto" }}><table className="tbl" style={{ minWidth: 600 }}><thead><tr><th>Name</th><th>Email</th><th>Program</th><th>Decision</th><th>By</th><th>When</th></tr></thead><tbody>{done.map((r) => (<tr key={r.id}><td>{r.name}</td><td className="muted">{r.email}</td><td>{r.program}</td><td><span className={`badge ${r.status === "approved" ? "b-approved" : "b-rejected"}`}>{r.status}</span></td><td className="muted">{r.by || "—"}</td><td className="muted">{r.decidedAt ? new Date(r.decidedAt).toLocaleDateString("en-IN") : "—"}</td></tr>))}</tbody></table></div></Card>}</div>)}
    <p className="faint" style={{ fontSize: 11, marginTop: 12 }}>Approving creates a time-bound lab account with a one-time password, or adds access to the existing CAEE account with the same email.{rl.settings.notifyEmail ? "" : " Set a notification email under Integration Settings."}</p>
  </div>);
}

function RlProjects({ db, commit, who, rl }) {
  const hwData = useRlAdminHw(db, 30000).data; const hwJobs = (hwData && hwData.jobs) || [];
  const entitled = rlStudentsOf(db).filter((u) => rlAccess(db, u).ok).length;
  const upd = (i, patch) => commit(rlPatch(db, { projects: rl.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));
  return (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {rl.projects.map((p, i) => { const st = rlRunStats(hwJobs, (r) => RL_HW_REV[r.project_id] === p.id); const doneBy = new Set(st.runs.filter((r) => r.result === "PASSED").map((r) => r.user_id)).size; return (<Card key={p.id} style={{ padding: 14, opacity: p.enabled === false ? 0.6 : 1 }}><div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
      <span className="mono c-green" style={{ fontSize: 12, fontWeight: 700, width: 26, paddingTop: 6 }}>{String(i + 1).padStart(2, "0")}</span>
      <div style={{ flex: 1, minWidth: 220 }}><input className="inline-edit disp" style={{ fontWeight: 700, width: "100%" }} value={p.title} onChange={(e) => upd(i, { title: e.target.value })} aria-label="Project title" /><input className="inline-edit" style={{ width: "100%", fontSize: ".82rem", color: "var(--muted)", marginTop: 4 }} value={p.desc} onChange={(e) => upd(i, { desc: e.target.value })} aria-label="Project description" /></div>
      <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}><div style={{ textAlign: "center" }}><div className="mono head" style={{ fontWeight: 700 }}>{st.n}</div><div className="faint" style={{ fontSize: 10 }}>runs</div></div><div style={{ textAlign: "center" }}><div className="mono head" style={{ fontWeight: 700 }}>{st.rate == null ? "—" : st.rate + "%"}</div><div className="faint" style={{ fontSize: 10 }}>pass rate</div></div><div style={{ textAlign: "center" }}><div className="mono head" style={{ fontWeight: 700 }}>{entitled ? Math.round((doneBy / entitled) * 100) + "%" : "—"}</div><div className="faint" style={{ fontSize: 10 }}>completion</div></div>
        <button className={`toggle ${p.enabled !== false ? "on" : ""}`} onClick={() => { upd(i, { enabled: p.enabled === false }); }}><span className={`tickbox ${p.enabled !== false ? "on" : ""}`}>{p.enabled !== false && <Check size={11} color="#fff" />}</span>{p.enabled !== false ? "Shown" : "Hidden"}</button></div>
    </div></Card>); })}
    <p className="faint" style={{ fontSize: 11 }}>Run counts and pass rates come from finished hardware jobs on the lab server (last 200 jobs). Completion = students who passed ÷ students with active access. Title and description edits show on the public page and the student workspace.</p>
  </div>);
}

function RlNum({ label, value, onChange, min = 0, max = 100000, hint }) { return (<label style={{ display: "block", marginBottom: 12 }}><span className="lbl">{label}</span><input className="input" type="number" min={min} max={max} value={value} onChange={(e) => { const v = Number(e.target.value); onChange(Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : min); }} />{hint && <span className="faint" style={{ fontSize: 10.5 }}>{hint}</span>}</label>); }
function RlSafety({ db, commit, rl }) {
  const rt = rl.settings.runtime; const setRt = (k) => (v) => commit(rlSettings(db, { runtime: { ...rt, [k]: v } }));
  const upd = (i, patch) => commit(rlPatch(db, { projects: rl.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));
  const gates = [["Constrained project template", "Students edit only approved files; CAEE owns startup, linker, clocks, HAL and watchdog"], ["Source / AST policy scan", "Blocks inline asm, option-byte / RDP / debug changes, protected flash writes, SWD pin changes, unbounded blocking loops"], ["Isolated cloud build", "Sandbox with CPU, memory, process and time limits; no network, secrets or hardware"], ["Firmware artifact validation", "Target MCU, sections, flash/RAM ceilings, no option-byte content; SHA-256 recorded"], ["Independent hardware timeout", "Wall-clock limit enforced by the Lab Agent, not by student firmware"], ["Reset → power-cycle → health check", "Station returns to IDLE only after it passes; otherwise QUARANTINED"]];
  return (<div>
    <RlPanel title="Mandatory safety gates" sub="Every gate must pass before a station is allocated" right={<span className="badge b-pass">ALWAYS ON</span>}>{gates.map(([k, v]) => (<div key={k} className="divider" style={{ display: "flex", gap: 10, padding: "8px 0" }}><ShieldCheck size={16} className="c-pass" style={{ flex: "none", marginTop: 2 }} /><div><div className="head" style={{ fontWeight: 600, fontSize: ".86rem" }}>{k}</div><div className="faint" style={{ fontSize: 11.5 }}>{v}</div></div></div>))}<p className="faint" style={{ fontSize: 11, marginTop: 8 }}>Multiple loops are normal embedded code and are not rejected — only unbounded or blocking ones that break the project's execution contract. Static checks can't prove termination, so the hardware timeout is always enforced.</p></RlPanel>
    <RlPanel title="Global runtime limits"><div className="grid sm:grid-cols-4 gap-3"><RlNum label="Absolute max run (s)" min={5} max={300} value={rt.absoluteMaxSec} onChange={setRt("absoluteMaxSec")} /><RlNum label="Heartbeat period (ms)" min={100} max={10000} value={rt.heartbeatMs} onChange={setRt("heartbeatMs")} /><RlNum label="Violations before throttle" min={1} max={20} value={rt.violationLimit} onChange={setRt("violationLimit")} /><RlNum label="Within (hours)" min={1} max={168} value={rt.violationWindowH} onChange={setRt("violationWindowH")} /></div></RlPanel>
    <RlPanel title="Per-project execution policy" sub="For student-written firmware (Phase 2). Phase 1 runs only the approved Project 1 firmware with the server's fixed time limits." pad={0}><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Project</th><th>Time limit (s)</th><th>Allowed TX CAN IDs</th><th>Max frames/s</th><th>Bitrate (kbit/s)</th><th>PWM</th></tr></thead><tbody>{rl.projects.map((p, i) => (<tr key={p.id}><td style={{ fontWeight: 600 }}>{String(i + 1).padStart(2, "0")} · {p.title}</td><td><input className="input" style={{ width: 80 }} type="number" min="1" max={rt.absoluteMaxSec} value={p.maxWallSec} onChange={(e) => upd(i, { maxWallSec: Math.max(1, Math.min(rt.absoluteMaxSec, Number(e.target.value) || 1)) })} /></td><td><input className="input mono" style={{ width: 170 }} placeholder="e.g. 0x100,0x180-0x18F" value={p.canIds} onChange={(e) => upd(i, { canIds: e.target.value.replace(/[^0-9a-fA-FxX,\s-]/g, "") })} /></td><td><input className="input" style={{ width: 90 }} type="number" min="1" max="5000" value={p.maxFps} onChange={(e) => upd(i, { maxFps: Math.max(1, Math.min(5000, Number(e.target.value) || 1)) })} /></td><td><select className="sel" style={{ width: 100 }} value={p.bitrate} onChange={(e) => upd(i, { bitrate: Number(e.target.value) })}>{[125, 250, 500, 1000].map((b) => <option key={b} value={b}>{b}</option>)}</select></td><td><span className="badge b-ns" title="This bench has no actuators; PWM outputs fail the run">Not allowed</span></td></tr>))}</tbody></table></div><p className="faint" style={{ fontSize: 11, padding: "10px 16px" }}>Leave "Allowed TX CAN IDs" empty only while a project is hidden — the lab server should refuse runs for a project without a defined ID list.</p></RlPanel>
    <RlPanel title="Recent safety events" sub="Blocks and aborts, each turned into a student diagnostic" pad={rl.events.length ? 0 : 16}>{rl.events.length === 0 ? <p className="muted" style={{ fontSize: ".86rem" }}>No safety events recorded yet.</p> : (<div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>When</th><th>Job</th><th>Category</th><th>Diagnostic</th></tr></thead><tbody>{rl.events.slice(0, 200).map((e, i) => (<tr key={e.id || i}><td className="muted">{e.at ? new Date(e.at).toLocaleString("en-IN") : "—"}</td><td className="mono">{e.jobId || "—"}</td><td><b>{e.category}</b></td><td>{e.message}</td></tr>))}</tbody></table></div>)}</RlPanel>
  </div>);
}

function RlMediaField({ label, value, onChange, flash, slot }) {
  const url = useRlImg(value); const [busy, setBusy] = useState(false);
  const onFile = (e) => { const file = e.target.files && e.target.files[0]; e.target.value = ""; if (!file) return; if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return flash("Use a PNG, JPG, WebP or GIF image"); if (file.size > 1.5 * 1024 * 1024) return flash("Image too large — max 1.5 MB (export a smaller JPG/WebP)"); setBusy(true); const r = new FileReader(); r.onload = async () => { const key = `caee:rlmedia:${slot}:${Date.now()}`; try { await window.storage.set(key, r.result, true); onChange("store:" + key); flash("Image uploaded — press Save changes to publish"); } catch (x) { flash("Upload failed — check your connection"); } setBusy(false); }; r.readAsDataURL(file); };
  return (<div style={{ marginBottom: 14 }}><span className="lbl">{label}</span><div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><input className="input" style={{ flex: 1, minWidth: 200 }} value={String(value || "").startsWith("store:") ? "(uploaded image)" : value || ""} readOnly={String(value || "").startsWith("store:")} onChange={(e) => onChange(e.target.value.trim())} placeholder="https://… or upload" /><label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}><Upload size={13} /> {busy ? "Uploading…" : "Upload"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFile} style={{ display: "none" }} /></label>{value && <Btn sm kind="ghost" onClick={() => onChange("")}><Trash2 size={13} /></Btn>}</div>{url && <img src={url} alt="" style={{ marginTop: 8, maxHeight: 120, borderRadius: 10, border: "1px solid var(--border)" }} />}</div>);
}
function RlContent({ db, commit, flash, rl }) {
  const s = rl.settings; const set = (k) => (e) => commit(rlSettings(db, { [k]: e.target.value })); const setMedia = (k) => (v) => commit(rlSettings(db, { media: { ...s.media, [k]: v } }));
  return (<div>
    <RlPanel title="Public page text"><Field label="Page title (large heading)" value={s.heroTitle} onChange={set("heroTitle")} /><Area label="Intro paragraph" rows={3} value={s.heroSub} onChange={set("heroSub")} /><Field label="Launch / availability note (leave empty to hide)" value={s.launchNote} onChange={set("launchNote")} /></RlPanel>
    <RlPanel title="Lab photos & video" sub="Real photos of your rack, bench and runs build trust — only filled slots are shown">
      <RlMediaField label="Workspace preview image (front page + lab page)" value={s.media.dashboard} onChange={setMedia("dashboard")} flash={flash} slot="dashboard" />
      <RlMediaField label="Office remote-lab rack photo" value={s.media.rack} onChange={setMedia("rack")} flash={flash} slot="rack" />
      <RlMediaField label="STM32 + CAN hardware close-up" value={s.media.bench} onChange={setMedia("bench")} flash={flash} slot="bench" />
      <RlMediaField label="Student hardware run screenshot" value={s.media.run} onChange={setMedia("run")} flash={flash} slot="run" />
      <Field label="Short lab video (YouTube / Vimeo URL)" value={s.media.video} onChange={(e) => setMedia("video")(e.target.value.trim())} placeholder="https://youtu.be/…" />
    </RlPanel>
  </div>);
}
function RlIntegration({ db, commit, rl }) {
  const s = rl.settings; const tog = (k) => commit(rlSettings(db, { [k]: !s[k] })); const set = (k) => (e) => commit(rlSettings(db, { [k]: e.target.value.trim() }));
  const T = ({ k, label, hint }) => (<div style={{ marginBottom: 12 }}><button className={`toggle ${s[k] ? "on" : ""}`} onClick={() => tog(k)}><span className={`tickbox ${s[k] ? "on" : ""}`}>{s[k] && <Check size={11} color="#fff" />}</span>{label}</button>{hint && <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>{hint}</div>}</div>);
  const badUrl = s.statusUrl && !/^https:\/\/[^\s]+$/.test(s.statusUrl);
  return (<div>
    <RlPanel title="Website"><T k="publicPage" label="Remote Lab page + menu link visible" hint="Off hides the page, the menu link and the front-page band." /><T k="homeSection" label="Big Remote Lab band on the front page" /></RlPanel>
    <RlPanel title="Notifications & live status">
      <Field label="Admin email for new access requests" value={s.notifyEmail} onChange={set("notifyEmail")} placeholder="admin@caee.co.in" />
      <p className="faint" style={{ fontSize: 11, marginTop: -6, marginBottom: 12 }}>Requests always appear under Access Requests with a count badge. Automatic emails need a mail service on the lab server.</p>
      <Field label="Lab status URL (optional, https)" value={s.statusUrl} onChange={set("statusUrl")} placeholder="(automatic)" />
      {badUrl && <div className="c-fail" style={{ fontSize: 11, marginTop: -8, marginBottom: 8 }}>Must be a full https:// URL.</div>}
      <p className="faint" style={{ fontSize: 11, marginTop: -6 }}>Leave empty: the public page reads live station status from the lab server ({rlApiBase(db) || "not configured"}/api/lab/status) and shows it only while a station is really online.</p>
    </RlPanel>
    <RlPanel title="Accounts & entitlements"><RlRow k="Login" v="Existing CAEE accounts (same email = same account)" /><RlRow k="B.Tech entitlement key" v="BTECH_REMOTE_LAB" /><RlRow k="M.Tech entitlement key" v="MTECH_REMOTE_LAB" /><RlRow k="First login" v="One-time password → student sets own password" /><RlRow k="Compile / assessment server" v={(db.site.labs && db.site.labs.compile) || "not set"} /></RlPanel>
  </div>);
}

/* ---------- Remote Hardware Lab: connection to the lab server (api.caee.co.in /api/lab/*) ---------- */
// Portal project id -> server-side predefined hardware job. The browser only ever sends this project id.
const RL_HW = { P01: "CAN_PROJECT_01" };
const RL_HW_REV = { CAN_PROJECT_01: "P01" };
function rlApiBase(db) {
  const c = String(((db.site && db.site.labs) || {}).compile || "").trim();
  if (!c) return "";
  try { const u = new URL(c, window.location.href); if (u.protocol === "https:" || /^(localhost|127\.0\.0\.1)$/.test(u.hostname)) return u.origin; } catch (e) {}
  return "";
}
function rlLabToken() { let t = window.__caeeLabToken; if (!t) { try { t = sessionStorage.getItem("caee:labToken"); } catch (e) {} } return t || ""; }
async function rlApi(db, path, opts = {}) {
  const fail = (message, extra) => Object.assign(new Error(message), extra || {});
  const base = rlApiBase(db);
  if (!base) throw fail("The lab server is not configured yet.", { code: "no-server" });
  const headers = { "Content-Type": "application/json" };
  if (opts.auth !== false) { const t = rlLabToken(); if (!t) throw fail("Your lab session is missing — sign out and sign in again to use the hardware lab.", { code: "no-token" }); headers.Authorization = "Bearer " + t; }
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(base + path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined, signal: ctl.signal, cache: "no-store" });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok) throw fail(j.message || "The lab server answered HTTP " + r.status + ".", { code: j.error || r.status, status: r.status, data: j });
    return j;
  } catch (e) {
    if (e.name === "AbortError") throw fail("The lab server did not answer in time.", { code: "timeout" });
    if (e.code) throw e;
    throw fail("Could not reach the lab server.", { code: "network" });
  } finally { clearTimeout(tm); }
}
const RL_REASONS = {
  STUDENT_ECU_OFFLINE: "The Student ECU board was not detected at the lab station.", VEHICLE_EMULATOR_OFFLINE: "The Vehicle Emulator board was not detected at the lab station.",
  FLASH_FAILED: "Writing the firmware to the Student ECU failed.", FLASH_VERIFY_FAILED: "The firmware was written, but flash verification did not succeed.",
  STATION_BUSY: "The station stayed busy and could not take this run in time.", HARDWARE_TIMEOUT: "The hardware run did not finish within its time limit.",
  AGENT_OFFLINE: "The lab station was offline, so the run could not be completed.", INVALID_JOB_TYPE: "This run type is not supported by the station.",
  INVALID_ARTIFACT: "The approved firmware was not available on the station.", STATION_HEALTH_FAILED: "The station's health check failed, so the run was stopped safely.",
  RUNTIME_CHECK_FAILED: "The firmware ran, but the CAN behaviour check did not pass.", STUDENT_RESET_FAILED: "The Student ECU did not confirm its reset.",
  AGENT_ERROR: "The lab station hit an internal error.", SECURITY_POLICY_VIOLATION: "The run was stopped by a hardware safety rule.",
  CANCELLED_BY_ADMIN: "The run was stopped by the lab administrator.", CANCELLED_BY_STUDENT: "You cancelled this run.",
};
const RL_STEPS = [["QUEUED", "Queued"], ["CLAIMED", "Station assigned"], ["CHECKING_HARDWARE", "Checking hardware"], ["FLASHING", "Flashing"], ["RUNNING", "Running"], ["DONE", "Result"]];
const rlTerminal = (s) => s === "PASSED" || s === "FAILED" || s === "CANCELLED";
const rlBoard = (v) => (v === "ONLINE" ? "Online" : v === "OFFLINE" ? "Offline" : "—");
const rlDur = (ms) => (ms == null ? "—" : ms < 60000 ? (ms / 1000).toFixed(1) + " s" : Math.floor(ms / 60000) + " min " + Math.round((ms % 60000) / 1000) + " s");
const rlWhen = (iso) => (iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—");
const rlJobBadge = (j) => (j.status === "PASSED" ? "b-pass" : j.status === "FAILED" ? "b-fail" : j.status === "CANCELLED" ? "b-ns" : "b-pending");
// public status: only shown when at least one station is really online (never a made-up "Online")
function useRlStatus(url) {
  const [st, setSt] = useState(null);
  useEffect(() => { if (!url || !/^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1))/.test(url)) { setSt(null); return; } let live = true;
    const load = () => { const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
      fetch(url, { signal: ctl.signal, cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (!live) return; if (!j || !Array.isArray(j.stations)) return setSt(null); const online = j.stations.filter((s) => s.online === true).length; setSt({ online, total: j.stations.length, queued: Number(j.queued) || 0 }); }).catch(() => live && setSt(null)).finally(() => clearTimeout(t)); };
    load(); const iv = setInterval(load, 30000);
    return () => { live = false; clearInterval(iv); }; }, [url]);
  return st;
}
const rlStatusUrl = (db, s) => s.statusUrl || (rlApiBase(db) ? rlApiBase(db) + "/api/lab/status" : "");

function RlJobPanel({ job, onCancel, busy }) {
  if (!job) return null;
  const c = job.checks || {}; const rc = c.runtime_check || null; const done = rlTerminal(job.status);
  const idx = done ? RL_STEPS.length - 1 : Math.max(0, RL_STEPS.findIndex(([k]) => k === job.status));
  const flash = c.flash_verified === true ? "Verified" : done && job.status !== "CANCELLED" ? "Not verified" : ["FLASHING"].includes(job.status) ? "In progress…" : "—";
  const can = !rc ? (job.status === "RUNNING" ? "Checking…" : "—") : !rc.performed ? "Not measured in Phase 1" : `${rc.passed ? "Passed" : "Failed"} · RX +${rc.rx_frames_delta ?? "?"} frames${rc.engine_rpm != null ? " · " + rc.engine_rpm + " rpm" : ""}${rc.can_timeout != null ? (rc.can_timeout ? " · CAN timeout" : " · no timeout") : ""}`;
  const result = job.status === "PASSED" ? "Passed" : job.status === "FAILED" ? "Failed" : job.status === "CANCELLED" ? "Cancelled" : "Pending";
  const rows = [["Station", job.station_id || (job.status === "QUEUED" ? `Waiting for a free station${job.queue_position ? " · position " + job.queue_position + " in queue" : ""}` : "—")], ["Student ECU", rlBoard(c.student_ecu)], ["Vehicle Emulator", rlBoard(c.vehicle_emulator)], ["Firmware flash", flash], ["CAN behaviour", can], ["Hardware result", result]];
  return (<Card style={{ padding: 18, marginBottom: 18, borderColor: job.status === "PASSED" ? "rgba(31,157,87,.45)" : job.status === "FAILED" ? "rgba(210,59,63,.4)" : "var(--green)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}><div><div className="disp head" style={{ fontWeight: 700 }}>{job.title || "Hardware run"}</div><div className="faint mono" style={{ fontSize: 11 }}>{job.job_id} · started {rlWhen(job.created_at)}</div></div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span className={`badge ${rlJobBadge(job)}`} style={{ fontSize: 12 }}>{job.status.replace(/_/g, " ")}</span>{job.status === "QUEUED" && onCancel && <Btn sm kind="ghost" disabled={busy} onClick={onCancel}><X size={12} /> Cancel</Btn>}</div></div>
    <div className="rl-steps">{RL_STEPS.map(([k, label], i) => { const st = i < idx ? "done" : i === idx ? (done ? (job.status === "PASSED" ? "done" : "bad") : "now") : ""; return (<div key={k} className={`rl-step ${st}`}><span className="rl-step-dot">{st === "done" ? <Check size={11} /> : st === "bad" ? <X size={11} /> : i + 1}</span><span>{i === RL_STEPS.length - 1 && done ? result : label}</span></div>); })}</div>
    <div className="grid sm:grid-cols-2 gap-2" style={{ marginTop: 14 }}>{rows.map(([k, v]) => (<div key={k} className="divider" style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", fontSize: ".86rem" }}><span className="muted">{k}</span><b className={v === "Passed" || v === "Verified" || v === "Online" ? "c-pass" : v === "Failed" || v === "Offline" || v === "Not verified" ? "c-fail" : "ink"} style={{ textAlign: "right" }}>{v}</b></div>))}</div>
    {job.status === "FAILED" && job.failure_reason && <div className="note" style={{ marginTop: 12, background: "var(--failbg)", color: "var(--fail)" }}><AlertCircle size={13} style={{ verticalAlign: "-2px" }} /> {RL_REASONS[job.failure_reason] || job.failure_reason} <span className="mono" style={{ fontSize: 10, opacity: 0.8 }}>({job.failure_reason})</span></div>}
    {done && job.execution_ms != null && <div className="faint" style={{ fontSize: 11, marginTop: 8 }}>Execution time {rlDur(job.execution_ms)}{job.status === "PASSED" && rc && !rc.performed ? " · Phase 1 flashes and starts the approved Project 1 firmware on the physical Student ECU." : ""}</div>}
    {!done && <div className="faint" style={{ fontSize: 11, marginTop: 8 }}>Updates automatically — you can keep this page open.</div>}
  </Card>);
}

/* ---------- student workspace ---------- */
function RemoteLabWorkspace({ db, session, setView }) {
  const me = db.users.find((u) => u.id === session.id) || session; const rl = rlOf(db); const acc = rlAccess(db, me);
  const projects = rl.projects.filter((p) => p.enabled !== false);
  const [st, setSt] = useState(null); const [jobs, setJobs] = useState(null); const [active, setActive] = useState(null); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const base = rlApiBase(db); const hasTok = !!rlLabToken();
  const loadStatus = useCallback(() => rlApi(db, "/api/lab/status", { auth: false }).then(setSt).catch((e) => setSt({ error: e.message })), [base]);
  const loadJobs = useCallback(() => rlApi(db, "/api/lab/jobs?limit=20").then((j) => { setJobs(j.jobs || []); const open = (j.jobs || []).find((x) => !rlTerminal(x.status)); if (open) setActive(open); }).catch((e) => { setJobs([]); if (e.code !== "no-server") setMsg(e.message); }), [base]);
  useEffect(() => { if (!base) return; loadStatus(); const iv = setInterval(loadStatus, 15000); return () => clearInterval(iv); }, [base]);
  useEffect(() => { if (acc.ok && base && hasTok) loadJobs(); }, [acc.ok, base, hasTok]);
  const activeId = active && !rlTerminal(active.status) ? active.job_id : null;
  useEffect(() => { if (!activeId) return; let stop = false;
    const tick = () => rlApi(db, "/api/lab/jobs/" + activeId).then((j) => { if (stop) return; setActive(j.job); if (rlTerminal(j.job.status)) { loadJobs(); loadStatus(); } }).catch(() => {});
    const iv = setInterval(tick, 2000); return () => { stop = true; clearInterval(iv); }; }, [activeId]);
  const station = st && st.stations && st.stations[0]; const online = !!(st && st.stations && st.stations.some((s) => s.online));
  const run = async (p) => { setMsg(""); setBusy(true); try { const r = await rlApi(db, "/api/lab/jobs", { method: "POST", body: { project_id: RL_HW[p.id] } }); setActive(r.job); window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { if (e.code === "job-active" && e.data && e.data.job) setActive(e.data.job); else setMsg(e.message); } setBusy(false); };
  const cancel = async () => { setBusy(true); try { const r = await rlApi(db, "/api/lab/jobs/" + active.job_id + "/cancel", { method: "POST", body: {} }); setActive(r.job); loadJobs(); } catch (e) { setMsg(e.message); } setBusy(false); };
  const passedHw = new Set((jobs || []).filter((j) => j.result === "PASSED").map((j) => RL_HW_REV[j.project_id]));
  const msgFor = { Pending: "Your lab access is waiting for approval by the CAEE team.", Scheduled: "Your lab access starts soon.", Suspended: "Your lab access is paused. Contact the CAEE team if you think this is a mistake.", Expired: "Your lab access period has ended. Contact the CAEE team to extend it.", None: "Remote Lab access isn't part of your account yet. Send a request and the CAEE team will review it." }[acc.status];
  const stationLine = !base ? "The hardware lab server is not connected to this website yet." : !st ? "Checking the lab station…" : st.error ? "Could not reach the lab server right now." : online ? `${station.station_id} is online — Student ECU ${rlBoard(station.student_ecu)}, Vehicle Emulator ${rlBoard(station.vehicle_emulator)}${station.state === "BUSY" ? " · running a job" : ""}${st.queued ? ` · ${st.queued} in queue` : ""}.` : "The lab station is offline right now. Runs you start will wait in the queue.";
  return (<div className="max-w-5xl mx-auto px-5" style={{ paddingTop: 40, paddingBottom: 40 }}>
    {!me.labOnly && <div style={{ marginBottom: 14 }}><BackLink onClick={() => setView("student")} /></div>}
    <div className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>STM32 Remote Lab</div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}><h1 className="disp head" style={{ fontSize: "1.6rem", fontWeight: 700 }}>Welcome, {(me.name || "").split(" ")[0]}</h1><RlStatus st={acc.status} />{acc.ok && acc.days != null && <span className="pill pill-green"><Hourglass size={11} /> {acc.days} day{acc.days === 1 ? "" : "s"} left</span>}</div>
    <p className="muted" style={{ fontSize: ".9rem", marginBottom: 18 }}>Automotive ECU engineering projects on real STM32 NUCLEO-G474RE hardware.</p>
    {!acc.ok ? (<Card style={{ padding: 24 }}><div className="ink" style={{ fontSize: ".95rem", lineHeight: 1.6 }}>{msgFor}</div><div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}><Btn kind="ghost" onClick={() => { window.__rlScroll = "rl-request"; setView("remotelab"); }}>About the Remote Lab</Btn>{db.site.whatsapp && <a className="btn btn-primary" href={`https://wa.me/${db.site.whatsapp}`} target="_blank" rel="noreferrer"><MessageSquare size={15} /> WhatsApp us</a>}</div></Card>) : (<>
      <Card style={{ padding: 16, marginBottom: 18, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", borderColor: online ? "rgba(31,157,87,.35)" : "rgba(214,158,46,.55)", background: online ? "var(--passbg)" : "rgba(232,184,75,.08)" }}>
        {online ? <Wifi size={20} className="c-pass" /> : <WifiOff size={20} className="c-gold" />}
        <div style={{ flex: 1, minWidth: 220 }}><div className="ink" style={{ fontWeight: 700, fontSize: ".92rem" }}>{online ? "Hardware station online" : "Hardware station offline"}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{stationLine}</div></div>
        <div className="mono ink" style={{ fontSize: 12 }}>{projects.filter((p) => passedHw.has(p.id)).length}/{projects.length} passed on hardware</div>
      </Card>
      {!hasTok && base && <div className="note" style={{ marginBottom: 14, background: "rgba(232,184,75,.12)" }}><KeyRound size={13} style={{ verticalAlign: "-2px" }} /> Sign out and sign in again to start hardware runs (your lab session was not created on this visit).</div>}
      {msg && <div className="note" style={{ marginBottom: 14, background: "var(--failbg)", color: "var(--fail)" }}><AlertCircle size={13} style={{ verticalAlign: "-2px" }} /> {msg}</div>}
      <RlJobPanel job={active} onCancel={cancel} busy={busy} />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">{projects.map((p, i) => { const hw = RL_HW[p.id]; const ok = passedHw.has(p.id); const tried = (jobs || []).some((j) => RL_HW_REV[j.project_id] === p.id); const open = !!activeId; return (<div key={p.id} className="card rl-proj" style={hw ? { borderColor: "var(--green)" } : null}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="mono c-green" style={{ fontSize: 12, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span><span className={`badge ${ok ? "b-pass" : tried ? "b-sub" : "b-ns"}`}>{ok ? "Passed on hardware" : tried ? "Attempted" : hw ? "Available" : "Coming soon"}</span></div><div className="disp head" style={{ fontWeight: 700, fontSize: ".95rem", marginTop: 6 }}>{p.title}</div><div className="muted" style={{ fontSize: ".82rem", lineHeight: 1.5, marginTop: 4, flex: 1 }}>{p.desc}</div>{hw ? (<><div className="faint" style={{ fontSize: 11, marginTop: 10 }}>Phase 1 runs the approved Project 1 firmware on the physical Student ECU.</div><button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} disabled={busy || open || !base || !hasTok} onClick={() => run(p)}><Cpu size={13} /> {open ? "Run in progress…" : busy ? "Starting…" : "Run on hardware"}</button></>) : (<button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} disabled title="Opens after Project 1"><Lock size={12} /> Opens after Project 1</button>)}</div>); })}</div>
      <Card style={{ padding: 0, marginTop: 22, overflow: "hidden" }}><div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="divider"><div className="disp head" style={{ fontWeight: 700, fontSize: ".95rem" }}>My hardware runs</div>{jobs && <button className="navlink" style={{ padding: 0 }} onClick={loadJobs}><RefreshCw size={12} style={{ verticalAlign: "-1px" }} /> Refresh</button>}</div>{!jobs || jobs.length === 0 ? <div className="muted" style={{ padding: 18, fontSize: ".85rem" }}>{jobs ? "No hardware runs yet." : "—"}</div> : (<div style={{ overflowX: "auto" }}><table className="tbl" style={{ minWidth: 620 }}><thead><tr><th>Run</th><th>Project</th><th>Result</th><th>Station</th><th>Duration</th><th>When</th></tr></thead><tbody>{jobs.map((j) => (<tr key={j.job_id} onClick={() => setActive(j)} style={{ cursor: "pointer" }}><td className="mono">{j.job_id}</td><td>{j.title}</td><td><span className={`badge ${rlJobBadge(j)}`}>{j.status.replace(/_/g, " ")}</span>{j.failure_reason && <div className="faint" style={{ fontSize: 10 }}>{j.failure_reason}</div>}</td><td>{j.station_id || "—"}</td><td className="mono">{rlDur(j.execution_ms)}</td><td className="muted">{rlWhen(j.created_at)}</td></tr>))}</tbody></table></div>)}</Card>
    </>)}
  </div>);
}

/* ---------- Super Admin: live hardware data ---------- */
function useRlAdminHw(db, pollMs = 5000) {
  const [state, setState] = useState({ data: null, error: "" }); const base = rlApiBase(db);
  const load = useCallback(() => rlApi(db, "/api/lab/admin/hardware").then((d) => setState({ data: d, error: "" })).catch((e) => setState((s) => ({ data: s.data, error: e.message }))), [base]);
  useEffect(() => { load(); const iv = setInterval(load, pollMs); return () => clearInterval(iv); }, [base]);
  return { ...state, reload: load };
}
const rlUserName = (db, id) => { const u = db.users.find((x) => x.id === id); return u ? u.name : id; };
function RlHwError({ error }) { return error ? <div className="note" style={{ marginBottom: 12, background: "rgba(232,184,75,.12)" }}><AlertTriangle size={13} style={{ verticalAlign: "-2px" }} /> Live hardware data: {error}</div> : null; }

function RlOverview({ db, rl, go }) {
  const hw = useRlAdminHw(db, 10000); const d = hw.data; const s = rl.settings;
  const studs = rlStudentsOf(db); const active = studs.filter((u) => rlAccess(db, u).ok).length; const pend = rl.requests.filter((r) => r.status === "pending").length;
  const online = d ? d.stations.filter((x) => x.online).length : 0; const total = d ? d.stations.length : 0;
  const rate = d && d.counts.passed_24h + d.counts.failed_24h ? Math.round((d.counts.passed_24h / (d.counts.passed_24h + d.counts.failed_24h)) * 100) : null;
  const check = [["Public lab page", s.publicPage ? "Live" : "Hidden", s.publicPage ? "ok" : "warn"], ["Programme access", [s.programAccess.btech.on && "B.Tech", s.programAccess.mtech.on && "M.Tech"].filter(Boolean).join(" + ") || "Individual only", "ok"],
    ["Lab server", rlApiBase(db) ? rlApiBase(db).replace(/^https?:\/\//, "") : "Not configured", rlApiBase(db) ? "ok" : "bad"], ["Lab Agent credential on server", d ? (d.config.agent_auth_configured ? "Configured" : "Missing") : "—", d && d.config.agent_auth_configured ? "ok" : "warn"],
    ["Office Lab Agent heartbeat", d ? (online ? `${online} station online` : "Not connected") : "—", online ? "ok" : "warn"], ["Hardware projects live", "Project 1 (CAN_PROJECT_01)", "ok"]];
  return (<div>
    <RlHwError error={hw.error} />
    <div className="rl-kpis"><RlKpi label="Students with active lab access" value={active} sub={`${studs.length} students in total`} /><RlKpi label="Hardware stations online" value={d ? `${online} / ${total}` : "—"} sub="From Lab Agent heartbeat" warn={!online} /><RlKpi label="Jobs queued / running" value={d ? `${d.counts.queued} / ${d.counts.active}` : "—"} sub="Live queue" /><RlKpi label="Hardware pass rate (24 h)" value={rate == null ? "—" : `${rate}%`} sub={d ? `${d.counts.passed_24h + d.counts.failed_24h} finished runs` : ""} /></div>
    <div className="grid md:grid-cols-2 gap-4" style={{ marginTop: 16 }}>
      <RlPanel title="Lab readiness" sub="What is live and what still needs connecting">{check.map(([k, v, t]) => <RlRow key={k} k={k} v={v} tone={t} />)}</RlPanel>
      <RlPanel title="Needs your attention" sub="Quick links">
        <RlRow k="Pending access requests" v={<button className="navlink" style={{ padding: 0, fontWeight: 700 }} onClick={() => go("requests")}>{pend} →</button>} tone={pend ? "warn" : null} />
        <RlRow k="Students expiring in 7 days" v={studs.filter((u) => { const a = rlAccess(db, u); return a.ok && a.days != null && a.days <= 7; }).length} />
        <RlRow k="Suspended students" v={studs.filter((u) => rlAccess(db, u).status === "Suspended").length} />
        <RlRow k="Failed hardware runs (24 h)" v={d ? <button className="navlink" style={{ padding: 0, fontWeight: 700 }} onClick={() => go("runs")}>{d.counts.failed_24h} →</button> : "—"} tone={d && d.counts.failed_24h ? "warn" : null} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}><Btn sm onClick={() => go("students")}><UserPlus size={13} /> Add student</Btn><Btn sm kind="ghost" onClick={() => go("scheduler")}><ListOrdered size={13} /> Live queue</Btn></div>
      </RlPanel>
    </div>
  </div>);
}

function RlJobsTable({ db, list, onCancel, busy, compact }) {
  const [open, setOpen] = useState(null);
  if (!list.length) return null;
  return (<div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Job</th><th>Student</th><th>Project</th><th>Station</th><th>Status</th>{!compact && <th>Start</th>}{!compact && <th>End</th>}<th>Duration</th><th>Failure reason</th>{onCancel && <th></th>}</tr></thead><tbody>{list.map((j) => (<React.Fragment key={j.job_id}><tr onClick={() => setOpen(open === j.job_id ? null : j.job_id)} style={{ cursor: "pointer" }}>
    <td className="mono">{j.job_id}</td><td><div className="head" style={{ fontWeight: 600 }}>{rlUserName(db, j.user_id)}</div><div className="faint" style={{ fontSize: 10 }}>{j.user_role}</div></td><td>{j.project_id}</td><td>{j.station_id || "—"}</td><td><span className={`badge ${rlJobBadge(j)}`}>{j.status.replace(/_/g, " ")}</span>{j.status === "QUEUED" && j.queue_position && <div className="faint" style={{ fontSize: 10 }}>#{j.queue_position} in queue</div>}</td>
    {!compact && <td className="muted">{rlWhen(j.claimed_at || j.created_at)}</td>}{!compact && <td className="muted">{rlWhen(j.completed_at)}</td>}<td className="mono">{rlDur(j.execution_ms)}</td><td className="faint" style={{ fontSize: 11 }}>{j.failure_reason || "—"}</td>
    {onCancel && <td>{!rlTerminal(j.status) && <Btn sm kind="danger" disabled={busy} onClick={(e) => { e.stopPropagation(); onCancel(j); }}><X size={12} /> {j.status === "QUEUED" ? "Cancel" : "Stop"}</Btn>}</td>}</tr>
    {open === j.job_id && (<tr><td colSpan={onCancel ? 10 : 9} style={{ background: "var(--tint)" }}><div className="grid sm:grid-cols-2 gap-4"><div><div className="lbl">Checks reported by the Lab Agent</div><div className="code" style={{ maxHeight: 180 }}>{JSON.stringify(j.checks || {}, null, 2)}</div>{j.detail && <div className="faint" style={{ fontSize: 11, marginTop: 6 }}>Detail: {j.detail}</div>}</div><div><div className="lbl">State transitions</div>{(j.events || []).map((e, i) => <div key={i} className="ink" style={{ fontSize: 11.5, padding: "2px 0" }}><span className="mono faint">{rlWhen(e.at)}</span> · <b>{e.status}</b> {e.detail ? "— " + e.detail : ""} <span className="faint">({e.actor})</span></div>)}</div></div></td></tr>)}
  </React.Fragment>))}</tbody></table></div>);
}

function RlRuns({ db }) {
  const hw = useRlAdminHw(db, 10000); const [qy, setQy] = useState(""); const [res, setRes] = useState("all");
  const all = (hw.data && hw.data.jobs) || [];
  const list = all.filter((j) => (res === "all" || (res === "open" ? !rlTerminal(j.status) : j.status === res)) && (rlUserName(db, j.user_id) + " " + j.job_id + " " + j.project_id + " " + (j.failure_reason || "")).toLowerCase().includes(qy.toLowerCase()));
  const csv = () => exportCSV(["Job", "Student", "User id", "Project", "Station", "Status", "Created", "Started (claimed)", "Ended", "Duration ms", "Failure reason"], list.map((j) => [j.job_id, rlUserName(db, j.user_id), j.user_id, j.project_id, j.station_id || "", j.status, j.created_at || "", j.claimed_at || "", j.completed_at || "", j.execution_ms ?? "", j.failure_reason || ""]), "caee-hardware-jobs.csv");
  return (<div>
    <RlHwError error={hw.error} />
    <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}><input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Search student, job id, project or reason" value={qy} onChange={(e) => setQy(e.target.value)} /><select className="sel" style={{ width: "auto" }} value={res} onChange={(e) => setRes(e.target.value)}><option value="all">All results</option><option value="PASSED">Passed</option><option value="FAILED">Failed</option><option value="CANCELLED">Cancelled</option><option value="open">In progress</option></select><Btn kind="ghost" onClick={csv} disabled={!list.length}><Download size={14} /> CSV</Btn></div>
    {!hw.data ? <Empty msg={hw.error ? "Live job history is unavailable right now." : "Loading hardware job history…"} /> : list.length === 0 ? <Empty msg={all.length ? "No jobs match." : "No hardware jobs yet. They appear here as soon as a student presses Run on hardware."} /> : <Card style={{ padding: 0, overflow: "hidden" }}><RlJobsTable db={db} list={list} /></Card>}
    <p className="faint" style={{ fontSize: 11, marginTop: 10 }}>Last 200 jobs from the lab server. Click a row for the agent's checks and every state change with its time.</p>
  </div>);
}

function RlScheduler({ db, flash, who }) {
  const hw = useRlAdminHw(db, 3000); const d = hw.data; const [busy, setBusy] = useState(false);
  const online = d ? d.stations.filter((x) => x.online).length : 0;
  const cancel = async (j) => { if (!window.confirm(j.status === "QUEUED" ? `Cancel queued job ${j.job_id}?` : `Stop job ${j.job_id} that is ${j.status.replace(/_/g, " ").toLowerCase()} on ${j.station_id}? The agent stops at its next step.`)) return; setBusy(true); try { await rlApi(db, "/api/lab/jobs/" + j.job_id + "/cancel", { method: "POST", body: {} }); flash(j.status === "QUEUED" ? "Job cancelled" : "Job stopped — station released"); hw.reload(); } catch (e) { flash(e.message); } setBusy(false); };
  return (<div>
    <RlHwError error={hw.error} />
    <div className="rl-kpis"><RlKpi label="Queued" value={d ? d.counts.queued : "—"} /><RlKpi label="Running" value={d ? d.counts.active : "—"} /><RlKpi label="Stations available" value={d ? `${d.stations.filter((x) => x.state === "IDLE").length} / ${d.stations.length}` : "—"} sub="Online · idle · healthy" warn={!online} /><RlKpi label="Jobs started (24 h)" value={d ? d.counts.created_24h : "—"} /></div>
    <RlPanel title="Live hardware queue" sub="One job per station at a time; refreshes every 3 seconds" right={<span className={`badge ${online ? "b-pass" : "b-pending"}`}>{online ? "STATION ONLINE" : "NO STATION ONLINE"}</span>} pad={d && d.queue.length ? 0 : 16}>{!d ? <p className="muted" style={{ fontSize: ".86rem" }}>{hw.error ? "Unavailable." : "Loading…"}</p> : d.queue.length === 0 ? <p className="muted" style={{ fontSize: ".86rem" }}>The queue is empty.</p> : <RlJobsTable db={db} list={d.queue} onCancel={cancel} busy={busy} compact />}</RlPanel>
    <RlPanel title="Dispatch policy (enforced by the lab server)">
      <RlRow k="Eligible station" v="Heartbeat fresh · reports IDLE · Student ECU and Vehicle Emulator ONLINE" /><RlRow k="Claiming" v="Atomic — one job per station, one claim per job" /><RlRow k="Per student" v="One open run at a time · 10 runs per hour" />
      <RlRow k="Agent silent during a run" v={d ? `Job fails after ${d.config.lease_s} s without progress; station released` : "—"} /><RlRow k="Station considered offline" v={d ? `No heartbeat for ${d.config.heartbeat_stale_s} s` : "—"} /><RlRow k="Queued too long" v={d ? `Fails after ${Math.round(d.config.queue_max_age_s / 60)} min with the reason` : "—"} />
      <RlRow k="What the browser can send" v="Only a predefined project id — never files, paths, commands or board serials" /><RlRow k="Flash target" v="Student ECU only — Vehicle Emulator protected on the server and in the agent" />
    </RlPanel>
  </div>);
}

function RlInfra({ db, commit, who, rl }) {
  const hw = useRlAdminHw(db, 5000); const d = hw.data;
  const stored = rl.stations.some((s) => s.studentSerial || s.simulatorSerial);
  const wipe = () => commit({ ...rlPatch(db, { stations: rl.stations.map(({ studentSerial, simulatorSerial, ...rest }) => rest) }), audit: auditPush(db, "Remote lab: removed ST-LINK serials from the website data", who) });
  return (<div>
    <RlHwError error={hw.error} />
    {stored && <div className="note" style={{ marginBottom: 14, background: "var(--failbg)", color: "var(--fail)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><ShieldAlert size={14} /> ST-LINK serials are stored in the website data, which visitors can read. They belong only in the office agent's configuration. <Btn sm kind="danger" onClick={wipe}><Trash2 size={12} /> Remove them</Btn></div>}
    {!d ? <Empty msg={hw.error ? "Live station data is unavailable right now." : "Loading station status…"} /> : d.stations.map((s) => (<Card key={s.station_id} style={{ padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Server size={20} className="c-teal" /><span className="disp head" style={{ fontWeight: 800, fontSize: "1.15rem" }}>{s.station_id}</span><span className="pill pill-green">{s.station_type}</span></div><span className={`badge ${s.online ? (s.state === "BUSY" ? "b-sub" : s.state === "ERROR" ? "b-fail" : "b-pass") : "b-fail"}`} style={{ fontSize: 12 }}>{s.online ? s.state : "OFFLINE"}</span></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="tile"><div className="lbl">Student ECU</div><div className="head" style={{ fontWeight: 700 }}>{s.student_ecu_board}</div><div className={s.student_ecu === "ONLINE" ? "c-pass" : "c-fail"} style={{ fontSize: ".85rem", fontWeight: 700, marginTop: 4 }}>{s.online ? rlBoard(s.student_ecu) : "Unknown — station offline"}</div><div className="faint" style={{ fontSize: 11 }}>Receives the student firmware</div></div>
        <div className="tile"><div className="lbl">Vehicle Emulator</div><div className="head" style={{ fontWeight: 700 }}>{s.vehicle_emulator_board}</div><div className={s.vehicle_emulator === "ONLINE" ? "c-pass" : "c-fail"} style={{ fontSize: ".85rem", fontWeight: 700, marginTop: 4 }}>{s.online ? rlBoard(s.vehicle_emulator) : "Unknown — station offline"}</div><div className="faint" style={{ fontSize: 11 }}><Lock size={10} style={{ verticalAlign: "-1px" }} /> Protected — never flashed, erased or reset by jobs</div></div>
      </div>
      <div className="grid sm:grid-cols-4 gap-2" style={{ marginTop: 10 }}>{[["Agent last heartbeat", s.last_heartbeat_at ? `${rlWhen(s.last_heartbeat_at)} (${Math.round(s.heartbeat_age_s)} s ago)` : "never"], ["Current job", s.current_job_id || "none"], ["Queue length", String(d.counts.queued)], ["Agent version", s.agent_version || "—"]].map(([k, v]) => <div key={k} className="tile" style={{ padding: "10px 12px" }}><div className="lbl" style={{ marginBottom: 2 }}>{k}</div><div className="ink mono" style={{ fontSize: ".78rem", fontWeight: 600 }}>{v}</div></div>)}</div>
      {s.health_detail && <div className="faint" style={{ fontSize: 11, marginTop: 8 }}>Agent note: {s.health_detail}</div>}
    </Card>))}
    <RlPanel title="Office Lab Agent" sub="cae_cloud_agent.py on the always-on office laptop"><RlRow k="Connection" v="Outbound HTTPS only — nothing on the laptop is reachable from the internet" /><RlRow k="Board binding" v="By ST-LINK serial in the laptop's station_config.json — never sent by the website" /><RlRow k="Agent credential" v={d ? (d.config.agent_auth_configured ? "Configured (only its SHA-256 is on the server)" : "Not configured on the server") : "—"} tone={d && !d.config.agent_auth_configured ? "warn" : null} /><RlRow k="Job types this server offers" v={d ? d.config.projects.join(", ") : "—"} /></RlPanel>
  </div>);
}
