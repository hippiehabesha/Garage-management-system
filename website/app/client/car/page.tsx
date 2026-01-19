"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "@/style/client/car.module.css";

function V({ v }: { v: string | null }) {
  const value = v && v.trim() !== "" ? v : "—";
  return (
    <span className={value === "—" ? styles.placeholder : styles.value}>
      {value}
    </span>
  );
}

export default function Car() {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const checklistItems = useMemo(
    () => [
      "Windshield glass",
      "Headlamp LHS & RHS",
      "Turn S.lamp F RHS & LHS",
      "Side view mirror LHS & RHS, Cab",
      "Fender & Bumper",
      "Horn",
      "Engine hood",
      "Door handle",
      "Door glass",
      "Tail lamp RHS & LHS",
      "Main & sub tank fuel level",
      "Fuel tank cup",
      "Back door",
      "Spare tyre",
      "Back glass",
      "Jack with handle",
      "Wheel wrench",
      "Wheel bolt & nuts",
      "Battery type & condition",
      "Engine oil cup",
      "Brake fluid cup",
      "Clutch fluid cup",
      "Steering oil cup",
      "Oil deep stick",
      "Wiper water tank cup",
      "Radiator cup",
      "Wiper blade",
      "Radio tape & speaker",
      "Cigarette Lighter",
      "Floor mat",
      "Fire Etinguisher",
      "Reflector",
    ],
    []
  );

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [checks2, setChecks2] = useState<Record<string, boolean>>({});
  useEffect(() => {
    // initialize unchecked
    setChecks((prev) => {
      const next = { ...prev };
      checklistItems.forEach((k) => {
        if (!(k in next)) next[k] = false;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistItems.join("|")]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const runningTestItems = useMemo(
    () => [
      "Ignition warning light",
      "Oil pressure gauge",
      "Water temperature gauge",
      "Fuel gauge",
      "Ammeter",
      "Speedo",
      "Air pressure gauge",
      "Timing belt warning light",
      "Km/hour meter",
      "Switches",
      "Control knobs/ Lever",
      "Horn/ Reverse warning",
      "Indicators",
      "Headlights",
      "Side/ Rear lights",
      "Headlights dip switch",
      "Reverse lights",
      "Brake lights",
      "Windscreen wipers/washers",
      "Transmission brake",
      "Handbrake",
      "Clutch operation",
      "Brake operation",
      "Steering control",
      "Accelerator operation",
      "Tipper operation",
      "Tanker fittings",
    ],
    []
  );

  const engineAirExhaustItems = useMemo(
    () => [
      "Engine block",
      "Tappets/ Rocker box",
      "Exhaust manifold",
      "Exhaust muffler system",
      "Timing chain noise/ Belt condition",
      "Air intake system & air cleaner",
      "Turbocharger",
      "Engine mountings",
    ],
    []
  );

  const lubricationSystemItems = useMemo(
    () => [
      "Oil Pump pressure",
      "Oil breathers",
      "Oil lines / Oil Cooler",
      "Sump / plug / leakage",
      "Oil level / condition",
      "Oil filter",
    ],
    []
  );

  const fuelSystemItems = useMemo(
    () => [
      "Fuel Tank / Strainer",
      "Fuel Filters / Water trap",
      "Fuel Lift Pump",
      "Injection Pump / Carburetor",
      "Fuel lines / security",
      "Linkage / cable controls",
    ],
    []
  );

  const coolingSystemItems = useMemo(
    () => [
      "Thermostat",
      "Radiator & cap",
      "Hoses & Clamps",
      "Water Pump",
      "Fan & Belts",
    ],
    []
  );

  const ignitionSystemItems = useMemo(
    () => [
      "HT& LT leads, S/Plugs",
      "Distributor cap assy.",
      "Rotor arm, condenser, advance",
      "Ignition coil",
      "Suppressors",
      "Other",
    ],
    []
  );

  const electricalSystemItems = useMemo(
    () => [
      "Battery security / condition",
      "Electrolyte level / SG",
      "Glow / Heater Plugs",
      "Cables / wiring",
      "Starter Motor / Solenoid",
      "Alternator / Generator",
      "Drive Belts",
      "Regulator / Fuse Box",
      "Radio/Heater/AC etc.",
    ],
    []
  );

  const steeringSuspensionItems = useMemo(
    () => [
      "Steering box oil condition",
      "Power steering oil condition",
      "Steering linkage / ball joints",
      "Wheel alignment / angle",
      "Steering cylinders / lines",
      "Front suspension",
      "Rear suspension",
      "Front shock absorbers",
      "Rear shock absorbers",
    ],
    []
  );

  const transmissionItems = useMemo(
    () => [
      "Front / Rear / drive shaft",
      "Gear Box / Linkage",
      "Transfer Box / Linkage",
      "Gear Box & oil condition",
      "Transfer Box & oil condition",
      "Clutch oil level / condition",
      "Clutch lines & linkage",
      "Bell housing condition",
      "Power Take-off / Pump",
      "Transmission pump & gauge",
      "Transmission oil condition",
      "Transmission filter / screen",
      "Transmission control linkage",
      "Torque Convertor operation",
      "Final / Tandem Drives",
      "Final/ Tandem Drive oil",
    ],
    []
  );

  const axlesAndWheelsItems = useMemo(
    () => [
      "R / axle diff, bearings / mounts",
      "Rear axle oil condition",
      "F / axle diff., bearings / mounts",
      "Front axle oil condition",
      "Axle breathers",
      "Front & rear tires",
      "Wheel rims, nuts & studs",
    ],
    []
  );

  const brakesPneumaticsItems = useMemo(
    () => [
      "Master cylinder",
      "Slave Cylinder",
      "Brake oil reservoir",
      "Brakes lines, hoses, cables",
      "Brake shoes / wheel cylinders",
      "Brake drums / discs",
      "Transmission brake",
      "Handbrake",
      "Tank / Air Receiver",
      "Air valves & lines",
      "Chamber / Booster",
      "Compressor",
    ],
    []
  );

  const tracksItems = useMemo(
    () => [
      "Track idler & rollers",
      "Track tension / adjuster",
      "Track frame",
      "Drive sprocket",
      "Grouser condition",
      "Steering clutch, right",
      "Steering clutch, lefts",
    ],
    []
  );

  const bodyChassisFrameItems = useMemo(
    () => [
      "Bodywork condition",
      "Body mounts",
      "Chassis condition",
      "Cab ROP fittings",
      "Windscreen, rear cab glass",
      "Door windows / winders",
      "Door / glass seals",
    ],
    []
  );

  const vehicleAttachmentsItems = useMemo(
    () => [
      "Tipper body",
      "Tanker body",
      "Asphalt distributor heater",
      "Crane, loading",
      "Winch cable guides, rope",
      "Carrier / Flatbed body",
    ],
    []
  );

  const equipmentAttachmentsItems = useMemo(
    () => [
      "Blade / adjusters",
      "Bucket, lift arms, support pillars",
      "Backhoe bucket teeth",
      "Backhoe vibratory arm",
      "Excavator bucket teeth",
      "Scarified tynes, teeth, tips",
      "Ripper tynes, teeth, tips",
      "Roller drum scrapers",
      "Roller sprinkler system",
      "Lift cylinders, hoses, mounts",
      "Shift cylinder, hoses, mounts",
      "Swing motor, hoses, mounts",
      "Pivot cylinder, hoses, mounts",
      "Lean cylinder, hoses, mounts",
      "Other cylinder / motor",
    ],
    []
  );

  const equipmentRunningTestItems = useMemo(
    () => [
      "Hydraulic system low pressure",
      "Hydraulic system high pressure",
      "Pivot operation",
      "Lift, tilt, shift operation of",
      "Tilt operation",
      "Shift operation",
      "Scarified lift",
      "Ripper lift",
      "Backhoe, lift, swing, digging",
      "Compactor vibration",
      "Other test / check",
    ],
    []
  );

  const hydraulicSystemItems = useMemo(
    () => [
      "Hydraulic Pump / Filter",
      "Hydraulic Tank / Strainer",
      "Hydraulic motor",
      "Spool / Control valve",
      "Hydraulic lines & hoses",
    ],
    []
  );

  const otherItems = useMemo(
    () => [
      "Ancillary engine",
      "Ancillary pumps",
      "Spray bars",
      "Roof Rack",
      "Spare wheel",
      "Tow hitch / trailer connector",
      "Toolkit",
      "Emergency kit",
      "First Aid Kit",
      "Fire Extinguisher",
      "Mirrors",
      "Radio communication",
    ],
    []
  );

  useEffect(() => {
    // initialize step 2 checks for all groups
    setChecks2((prev) => {
      const next = { ...prev };
      [
        ...runningTestItems,
        ...engineAirExhaustItems,
        ...lubricationSystemItems,
        ...fuelSystemItems,
        ...coolingSystemItems,
        ...ignitionSystemItems,
        ...electricalSystemItems,
        ...steeringSuspensionItems,
        ...transmissionItems,
        ...axlesAndWheelsItems,
        ...brakesPneumaticsItems,
        ...tracksItems,
        ...bodyChassisFrameItems,
        ...vehicleAttachmentsItems,
        ...equipmentAttachmentsItems,
        ...equipmentRunningTestItems,
        ...hydraulicSystemItems,
        ...otherItems,
      ].forEach((k) => {
        if (!(k in next)) next[k] = false;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    runningTestItems.join("|"),
    engineAirExhaustItems.join("|"),
    lubricationSystemItems.join("|"),
    fuelSystemItems.join("|"),
    coolingSystemItems.join("|"),
    ignitionSystemItems.join("|"),
    electricalSystemItems.join("|"),
    steeringSuspensionItems.join("|"),
    transmissionItems.join("|"),
    axlesAndWheelsItems.join("|"),
    brakesPneumaticsItems.join("|"),
    tracksItems.join("|"),
    bodyChassisFrameItems.join("|"),
    vehicleAttachmentsItems.join("|"),
    equipmentAttachmentsItems.join("|"),
    equipmentRunningTestItems.join("|"),
    hydraulicSystemItems.join("|"),
    otherItems.join("|"),
  ]);

  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    running: false,
    engine: false,
    lubrication: false,
    fuel: false,
    cooling: false,
    ignition: false,
    electrical: false,
    steering: false,
    transmission: false,
    axles: false,
    brakes: false,
    tracks: false,
    body: false,
    vehicle: false,
    equipmentAttachments: false,
    equipmentRunning: false,
    hydraulic: false,
    other: false,
  });

  const qp = useMemo(
    () => ({
      plate: params.get("plate"),
      department: params.get("department"),
      model: params.get("model"),
      era_number: params.get("era_number"),
      driver_first_name: params.get("driver_first_name"),
      driver_last_name: params.get("driver_last_name"),
      mileage: params.get("mileage"),
      engine_number: params.get("engine_number"),
      serial_number: params.get("serial_number"),
    }),
    [params]
  );

  const [plate, setPlate] = useState<string | null>(qp.plate);
  const [department, setDepartment] = useState<string | null>(qp.department);
  const [model, setModel] = useState<string | null>(qp.model);
  const [era_number, setEraNumber] = useState<string | null>(qp.era_number);
  const [driver_first_name, setDriverFirstName] = useState<string | null>(
    qp.driver_first_name
  );
  const [driver_last_name, setDriverLastName] = useState<string | null>(
    qp.driver_last_name
  );
  const [mileage, setMileage] = useState<string | null>(qp.mileage);
  const [engine_number, setEngineNumber] = useState<string | null>(
    qp.engine_number
  );
  const [serial_number, setSerialNumber] = useState<string | null>(
    qp.serial_number
  );

  // Keep state in sync if query params change (e.g., via navigation)
  useEffect(() => {
    setPlate(qp.plate);
    setDepartment(qp.department);
    setModel(qp.model);
    setEraNumber(qp.era_number);
    setDriverFirstName(qp.driver_first_name);
    setDriverLastName(qp.driver_last_name);
    setMileage(qp.mileage);
    setEngineNumber(qp.engine_number);
    setSerialNumber(qp.serial_number);
  }, [qp]);

  // Fetch full details using plate or serial_number
  useEffect(() => {
    const key = qp.plate || qp.serial_number;
    if (!key) return;

    const url = new URL("http://localhost:3001/api/cars/detail");
    if (qp.plate) url.searchParams.set("plate", qp.plate);
    if (qp.serial_number)
      url.searchParams.set("serial_number", qp.serial_number);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url.toString());
        const ct = res.headers.get("content-type") || "";
        const raw = await res.text();
        let data: any = null;
        if (ct.includes("application/json")) {
          try {
            data = JSON.parse(raw);
          } catch {
            throw new Error("Invalid JSON from server");
          }
        } else {
          throw new Error(
            raw?.slice(0, 200) || "Non-JSON response from server"
          );
        }
        if (!res.ok || !data?.ok)
          throw new Error(data?.message || "Fetch failed");
        const car = data.car || {};
        if (cancelled) return;
        if (car.plate !== undefined) setPlate(String(car.plate ?? ""));
        if (car.department !== undefined)
          setDepartment(String(car.department ?? ""));
        if (car.model !== undefined) setModel(String(car.model ?? ""));
        if (car.era_number !== undefined)
          setEraNumber(String(car.era_number ?? ""));
        if (car.driver_first_name !== undefined)
          setDriverFirstName(String(car.driver_first_name ?? ""));
        if (car.driver_last_name !== undefined)
          setDriverLastName(String(car.driver_last_name ?? ""));
        if (car.mileage !== undefined) setMileage(String(car.mileage ?? ""));
        if (car.engine_number !== undefined)
          setEngineNumber(String(car.engine_number ?? ""));
        if (car.serial_number !== undefined)
          setSerialNumber(String(car.serial_number ?? ""));
      } catch {
        // ignore errors; display whatever is available
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qp.plate, qp.serial_number]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Car Details</h1>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => {
              setStep(1);
              setOpen(true);
            }}>
            <Image
              src="/add_car.png"
              alt="Add Jacket"
              width={20}
              height={20}
              className={styles.addIcon}
              priority
            />
            <span>Add Jacket</span>
          </button>
        </div>
      </div>
      <div className={styles.accent} />

      <section className={styles.card}>
        <div className={styles.grid}>
          <div className={styles.row}>
            <div className={styles.label}>Plate</div>
            <V v={plate} />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Department</div>
            <V v={department} />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Model</div>
            <V v={model} />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>ERA Number</div>
            <V v={era_number} />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Driver First Name</div>
            <V v={driver_first_name} />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Driver Last Name</div>
            <V v={driver_last_name} />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Mileage</div>
            <V v={mileage} />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Engine Number</div>
            <V v={engine_number} />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Serial Number</div>
            <V v={serial_number} />
          </div>
        </div>
      </section>

      <section className={styles.listArea}>
        {/* reserved for list content to be added later */}
      </section>

      {open && step === 1 && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.currentTarget === e.target) setOpen(false);
          }}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rc-title">
            <div className={styles.modalHeader}>
              <h2 id="rc-title" className={styles.modalTitle}>
                Receiving checklist
              </h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.toggleGrid}>
                {checklistItems.map((it) => {
                  const on = !!checks[it];
                  return (
                    <button
                      key={it}
                      type="button"
                      className={`${styles.toggleBtn} ${
                        on ? styles.toggleOn : ""
                      }`}
                      onClick={() => setChecks((s) => ({ ...s, [it]: !s[it] }))}
                      aria-pressed={on}>
                      <span>{it}</span>
                      <span
                        className={`${styles.pill} ${on ? styles.pillOn : ""}`}>
                        <span
                          className={`${styles.dot} ${on ? styles.dotOn : ""}`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() =>
                  setChecks(
                    Object.fromEntries(checklistItems.map((k) => [k, false]))
                  )
                }>
                Clear
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => {
                    setStep(2);
                    setOpen(true);
                  }, 0);
                }}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {open && step === 2 && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.currentTarget === e.target) setOpen(false);
          }}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rc2-title">
            <div className={styles.modalHeader}>
              <h2 id="rc2-title" className={styles.modalTitle}>
                Detail inspection
              </h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, running: !s.running }))
                  }
                  aria-expanded={openSection.running}>
                  <span className={styles.sectionTitle}>Running Test</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.running ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.running && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {runningTestItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, engine: !s.engine }))
                  }
                  aria-expanded={openSection.engine}>
                  <span className={styles.sectionTitle}>
                    Engine/ Air/ Exhaust
                  </span>
                  <span
                    className={`${styles.caret} ${
                      openSection.engine ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.engine && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {engineAirExhaustItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {/* Additional groups for Detail inspection */}
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({
                      ...s,
                      lubrication: !s.lubrication,
                    }))
                  }
                  aria-expanded={openSection.lubrication}>
                  <span className={styles.sectionTitle}>
                    Lubrication System
                  </span>
                  <span
                    className={`${styles.caret} ${
                      openSection.lubrication ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.lubrication && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {lubricationSystemItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, fuel: !s.fuel }))
                  }
                  aria-expanded={openSection.fuel}>
                  <span className={styles.sectionTitle}>Fuel System</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.fuel ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.fuel && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {fuelSystemItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, cooling: !s.cooling }))
                  }
                  aria-expanded={openSection.cooling}>
                  <span className={styles.sectionTitle}>Cooling System</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.cooling ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.cooling && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {coolingSystemItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, ignition: !s.ignition }))
                  }
                  aria-expanded={openSection.ignition}>
                  <span className={styles.sectionTitle}>Ignition System</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.ignition ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.ignition && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {ignitionSystemItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, electrical: !s.electrical }))
                  }
                  aria-expanded={openSection.electrical}>
                  <span className={styles.sectionTitle}>Electrical System</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.electrical ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.electrical && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {electricalSystemItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, steering: !s.steering }))
                  }
                  aria-expanded={openSection.steering}>
                  <span className={styles.sectionTitle}>
                    Steering & Suspension
                  </span>
                  <span
                    className={`${styles.caret} ${
                      openSection.steering ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.steering && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {steeringSuspensionItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({
                      ...s,
                      transmission: !s.transmission,
                    }))
                  }
                  aria-expanded={openSection.transmission}>
                  <span className={styles.sectionTitle}>Transmission</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.transmission ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.transmission && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {transmissionItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, axles: !s.axles }))
                  }
                  aria-expanded={openSection.axles}>
                  <span className={styles.sectionTitle}>Axles & Wheels</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.axles ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.axles && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {axlesAndWheelsItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, brakes: !s.brakes }))
                  }
                  aria-expanded={openSection.brakes}>
                  <span className={styles.sectionTitle}>
                    Brakes & Pneumatics
                  </span>
                  <span
                    className={`${styles.caret} ${
                      openSection.brakes ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.brakes && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {brakesPneumaticsItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, tracks: !s.tracks }))
                  }
                  aria-expanded={openSection.tracks}>
                  <span className={styles.sectionTitle}>Tracks</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.tracks ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.tracks && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {tracksItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, body: !s.body }))
                  }
                  aria-expanded={openSection.body}>
                  <span className={styles.sectionTitle}>
                    Body/ Chassis/ Frame
                  </span>
                  <span
                    className={`${styles.caret} ${
                      openSection.body ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.body && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {bodyChassisFrameItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, vehicle: !s.vehicle }))
                  }
                  aria-expanded={openSection.vehicle}>
                  <span className={styles.sectionTitle}>
                    Vehicle Attachments
                  </span>
                  <span
                    className={`${styles.caret} ${
                      openSection.vehicle ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.vehicle && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {vehicleAttachmentsItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({
                      ...s,
                      equipmentAttachments: !s.equipmentAttachments,
                    }))
                  }
                  aria-expanded={openSection.equipmentAttachments}>
                  <span className={styles.sectionTitle}>
                    Equipment Attachments
                  </span>
                  <span
                    className={`${styles.caret} ${
                      openSection.equipmentAttachments ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.equipmentAttachments && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {equipmentAttachmentsItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({
                      ...s,
                      equipmentRunning: !s.equipmentRunning,
                    }))
                  }
                  aria-expanded={openSection.equipmentRunning}>
                  <span className={styles.sectionTitle}>
                    Equipment Running Test
                  </span>
                  <span
                    className={`${styles.caret} ${
                      openSection.equipmentRunning ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.equipmentRunning && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {equipmentRunningTestItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, hydraulic: !s.hydraulic }))
                  }
                  aria-expanded={openSection.hydraulic}>
                  <span className={styles.sectionTitle}>Hydraulic System</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.hydraulic ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.hydraulic && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {hydraulicSystemItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() =>
                    setOpenSection((s) => ({ ...s, other: !s.other }))
                  }
                  aria-expanded={openSection.other}>
                  <span className={styles.sectionTitle}>Other</span>
                  <span
                    className={`${styles.caret} ${
                      openSection.other ? styles.caretOpen : ""
                    }`}>
                    ▶
                  </span>
                </button>
                {openSection.other && (
                  <div className={styles.sectionBody}>
                    <div className={styles.toggleGrid}>
                      {otherItems.map((it) => {
                        const on = !!checks2[it];
                        return (
                          <button
                            key={it}
                            type="button"
                            className={`${styles.toggleBtn} ${
                              on ? styles.toggleOn : ""
                            }`}
                            onClick={() =>
                              setChecks2((s) => ({ ...s, [it]: !s[it] }))
                            }
                            aria-pressed={on}>
                            <span>{it}</span>
                            <span
                              className={`${styles.pill} ${
                                on ? styles.pillOn : ""
                              }`}>
                              <span
                                className={`${styles.dot} ${
                                  on ? styles.dotOn : ""
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => {
                    setStep(1);
                    setOpen(true);
                  }, 0);
                }}>
                Back
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() =>
                  setChecks2(
                    Object.fromEntries(
                      Object.keys(checks2).map((k) => [k, false])
                    )
                  )
                }>
                Clear
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => {
                    setStep(3);
                    setOpen(true);
                  }, 0);
                }}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {open && step === 3 && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rc3-title">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 id="rc3-title" className={styles.modalTitle}>
                Operators
              </h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.sectionBody}>
                <div className={styles.toggleGrid}></div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => {
                    setStep(2);
                    setOpen(true);
                  }, 0);
                }}>
                Back
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnAccent}`}
                onClick={() => {
                  setOpen(false);
                }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
