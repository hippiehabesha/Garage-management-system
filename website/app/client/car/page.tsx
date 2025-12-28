"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

      <div className={styles.footerNote}>Orange · White · Black theme</div>
    </div>
  );
}
