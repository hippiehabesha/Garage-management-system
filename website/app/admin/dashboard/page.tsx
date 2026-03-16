"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  MessageSquare,
  LogOut,
  Search,
  Menu,
  CarFront,
  Wrench,
  PenTool,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  Key,
  ClipboardList,
  FileSearch,
  Shield
} from "lucide-react";
import styles from "../../../style/admin/dashboard.module.css";

const API = "http://localhost:3001/api/admin";

type Tab = "overview" | "cars" | "mechanics" | "technicians" | "inspections" | "checklists" | "admins" | "admin";

type Admin = {
  admin_id: number;
  username: string;
  password?: string;
};

type Car = {
  car_id: number;
  plate: string;
  department: string;
  model: string;
  era_number: string;
  driver_first_name: string;
  driver_last_name: string;
  mileage: number;
  engine_number: string;
  serial_number: string;
};


type Mechanic = {
  mechanic_id: number;
  first_name: string;
  last_name: string;
  badge_number: string;
  password: string;
};
type Technician = {
  technician_id: number;
  first_name: string;
  last_name: string;
  badge_number: string;
  password: string;
};

type Inspection = {
  di_id: number;
  car_id: number;
  mechanic_id: number;
  date: string;
  rc_id: number;
};

type Checklist = {
  rc_id: number;
  car_id: number;
  technician_id: number;
  date: string;
};

type Stats = {
  cars: number;
  mechanics: number;
  technicians: number;
  inspections: number;
  checklists: number;
  admins: number;
};

type Toast = { type: "success" | "error"; message: string } | null;

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<{ admin_id: number; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedMech, setSelectedMech] = useState<Mechanic | null>(null);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);

  const [modal, setModal] = useState<{
    type: "add" | "edit" | "delete";
    entity: Tab;
    data?: any;
  } | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, cRes, mRes, tRes, iRes, clRes, aRes] = await Promise.all([
        fetch(`${API}/stats`),
        fetch(`${API}/cars`),
        fetch(`${API}/mechanics`),
        fetch(`${API}/technicians`),
        fetch(`${API}/inspections`),
        fetch(`${API}/checklists`),
        fetch(`${API}/admins`),
      ]);
      const [sData, cData, mData, tData, iData, clData, aData] = await Promise.all([
        sRes.json(),
        cRes.json(),
        mRes.json(),
        tRes.json(),
        iRes.json(),
        clRes.json(),
        aRes.json(),
      ]);
      if (sData.ok) setStats(sData.stats);
      if (cData.ok) setCars(cData.rows);
      if (mData.ok) setMechanics(mData.rows);
      if (tData.ok) setTechnicians(tData.rows);
      if (iData.ok) setInspections(iData.rows);
      if (clData.ok) setChecklists(clData.rows);
      if (aData.ok) setAdmins(aData.rows);
    } catch {
      showToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAll();
    try {
      const stored = sessionStorage.getItem("adminUser");
      if (stored) setCurrentAdmin(JSON.parse(stored));
    } catch {}
  }, [fetchAll]);

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  function openAdd(entity: Tab) {
    const defaults: Record<string, Record<string, string>> = {
      cars: {
        plate: "",
        department: "",
        model: "",
        era_number: "",
        driver_first_name: "",
        driver_last_name: "",
        engine_number: "",
        serial_number: "",
        mileage: "",
      },
      mechanics: { first_name: "", last_name: "", badge_number: "", password: "" },
      technicians: { first_name: "", last_name: "", badge_number: "", password: "" },
      inspections: { car_id: "", mechanic_id: "", rc_id: "", date: "" },
      checklists: { car_id: "", technician_id: "", date: "" },
      admins: { username: "", password: "" },
    };
    setFormData(defaults[entity] || {});
    setModal({ type: "add", entity });
  }

  function openEdit(entity: Tab, row: any) {
    const clone: Record<string, string> = {};
    Object.keys(row).forEach((k) => {
      if (!k.endsWith("_id")) clone[k] = String(row[k] ?? "");
    });
    setFormData(clone);
    setModal({ type: "edit", entity, data: row });
  }

  function openDelete(entity: Tab, row: any) {
    setModal({ type: "delete", entity, data: row });
  }

  const idFieldMap: Record<string, string> = {
    cars: "car_id",
    mechanics: "mechanic_id",
    technicians: "technician_id",
    inspections: "di_id",
    checklists: "rc_id",
    admins: "admin_id",
  };

  async function handleSave() {
    if (!modal) return;
    setSaving(true);
    try {
      let url = `${API}/${modal.entity}`;
      let method = "POST";
      if (modal.type === "edit") {
        url += `/${modal.data[idFieldMap[modal.entity as Tab]]}`;
        method = "PUT";
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.message || "Failed");
      showToast(
        "success",
        modal.type === "add" ? "Created successfully" : "Updated successfully"
      );
      setModal(null);
      fetchAll();
    } catch (err: any) {
      showToast("error", err?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAdmin() {
    setSaving(true);
    try {
      const res = await fetch(`${API}/credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.message || "Failed");
      showToast("success", "Admin profile updated");
      setIsEditingAdmin(false);
    } catch (err: any) {
      showToast("error", err?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!modal || modal.type !== "delete") return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API}/${modal.entity}/${modal.data[idFieldMap[modal.entity as Tab]]}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (!res.ok || !result.ok)
        throw new Error(result.message || "Delete failed");
      showToast("success", "Deleted successfully");
      setModal(null);
      fetchAll();
    } catch (err: any) {
      showToast("error", err?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  function filterRows<T extends Record<string, any>>(rows: T[]): T[] {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }

  const fieldLabels: Record<string, string> = {
    plate: "Plate Number",
    department: "Department",
    model: "Model",
    era_number: "ERA Number",
    driver_first_name: "Driver First Name",
    driver_last_name: "Driver Last Name",
    engine_number: "Engine Number",
    serial_number: "Serial Number",
    mileage: "Mileage",
    username: "Username",
    password: "Password",
    first_name: "First Name",
    last_name: "Last Name",
    badge_number: "Badge Number",
    rc_id: "Checklist ID",
    car_id: "Car ID",
    mechanic_id: "Mechanic ID",
    technician_id: "Technician ID",
    date: "Date",
  };

  const entityLabel: Record<string, string> = {
    cars: "Car",
    mechanics: "Mechanic",
    technicians: "Technician",
    inspections: "Inspection",
    checklists: "Checklist",
    admins: "Admin",
  };

  function displayName(entity: string, row: any): string {
    if (entity === "cars") return row.plate || row.serial_number || "—";
    if (entity === "inspections") return `Inspection ID: ${row.di_id}`;
    if (entity === "checklists") return `Checklist ID: ${row.rc_id}`;
    if (entity === "admins") return row.username || "—";
    return `${row.first_name || ""} ${row.last_name || ""}`.trim() || "—";
  }

  const navItems: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: "overview", icon: <LayoutDashboard size={20} strokeWidth={2.5} />, label: "Overview" },
    { key: "cars", icon: <CarFront size={20} strokeWidth={2.5} />, label: "Cars" },
    { key: "mechanics", icon: <Wrench size={20} strokeWidth={2.5} />, label: "Mechanics" },
    { key: "technicians", icon: <PenTool size={20} strokeWidth={2.5} />, label: "Technicians" },
    { key: "admins", icon: <Shield size={20} strokeWidth={2.5} />, label: "Admins" },
  ];

  const driverName = (c: Car) => {
    const n = `${c.driver_first_name || ""} ${c.driver_last_name || ""}`.trim();
    return n || "—";
  };

  const getCarPlate = (id?: number) => cars.find((c) => c.car_id === id)?.plate || "Unknown Car";
  const getMechName = (id?: number) => {
    const m = mechanics.find((x) => x.mechanic_id === id);
    return m ? `${m.first_name} ${m.last_name}` : "Unknown Mechanic";
  };
  const getTechName = (id?: number) => {
    const t = technicians.find((x) => x.technician_id === id);
    return t ? `${t.first_name} ${t.last_name}` : "Unknown Technician";
  };

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ─────────────────── */}
      <aside className={isSidebarOpen ? styles.sidebar : styles.sidebarClosed}>
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarBrand}>
            <div>
              <div className={styles.brandName}>Garage Management</div>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            {navItems.map((n) => (
              <button
                key={n.key}
                id={`nav-${n.key}`}
                className={tab === n.key ? styles.navItemActive : styles.navItem}
                onClick={() => { setTab(n.key); setSelectedCar(null); setSelectedMech(null); setSelectedTech(null); }}
              >
                <span className={styles.navIcon}>{n.icon}</span>
                <span className={styles.navLabel}>{n.label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <div 
              className={styles.adminProfileCard}
              onClick={() => {
                setTab("admin");
                setIsEditingAdmin(false);
                setFormData({ username: "Admin", password: "" });
              }}
            >
              <div className={styles.adminAvatar}>A</div>
              <div className={styles.adminInfo}>
                <div className={styles.adminName}>Admin</div>
              </div>
            </div>
          </div>
        </div>
        {/* Toggle Button Overlapping Right Edge */}
        <button 
          className={styles.sidebarToggle}
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* ── Main ────────────────────── */}
      <div className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.topTitleGroup}>
            <div className={styles.pageTitle}>
              {tab === "admin" ? "Admin Settings" : navItems.find((n) => n.key === tab)?.label}
            </div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}><Search size={16} /></span>
              <input
                id="global-search"
                className={styles.searchInput}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <>
              {/* ── Overview ────────────── */}
              {tab === "overview" && stats && (
                <>
                  <div className={styles.statsGrid}>
                    {[
                      {
                        icon: <CarFront size={18} />,
                        cls: styles.statIconCars,
                        value: stats.cars,
                        label: "Cars",
                      },
                      {
                        icon: <Wrench size={18} />,
                        cls: styles.statIconMech,
                        value: stats.mechanics,
                        label: "Mechanics",
                      },
                      {
                        icon: <PenTool size={18} />,
                        cls: styles.statIconTech,
                        value: stats.technicians,
                        label: "Technicians",
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={styles.statCard}
                      >
                        <div className={styles.statHeader}>
                          <div className={s.cls}>{s.icon}</div>
                        </div>
                        <div className={styles.statValue}>{s.value}</div>
                        <div className={styles.statLabel}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Ranking Lists ────────────── */}
                  <div className={styles.listCardsGrid}>
                    {/* Recent Inspections List */}
                    <div className={styles.listCard}>
                      <div className={styles.listCardHeader}>
                        <div className={styles.listCardTitleGroup}>
                          <div className={`${styles.listCardIconWrap} ${styles.listCardIconWrapBlue}`}>
                            <FileSearch size={20} />
                          </div>
                          <div className={styles.listCardTitle}>Recent Inspections</div>
                        </div>
                        <button className={`${styles.listCardViewAll} ${styles.listCardViewAllBlue}`} onClick={() => setTab("inspections")}>
                          View All
                        </button>
                      </div>
                      <table className={styles.listCardTable}>
                        <thead>
                          <tr>
                            <th>Target Car</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const recentInspections = [...inspections]
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .slice(0, 6);

                            return recentInspections.map((ins, i) => (
                              <tr key={ins.di_id}>
                                <td>{getCarPlate(ins.car_id)}</td>
                                <td style={{ color: "#0f172a" }}>{new Date(ins.date).toLocaleDateString()}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Recent Checklists List */}
                    <div className={styles.listCard}>
                      <div className={styles.listCardHeader}>
                        <div className={styles.listCardTitleGroup}>
                          <div className={`${styles.listCardIconWrap} ${styles.listCardIconWrapGreen}`}>
                            <ClipboardList size={20} />
                          </div>
                          <div className={styles.listCardTitle}>Recent Checklists</div>
                        </div>
                        <button className={`${styles.listCardViewAll} ${styles.listCardViewAllGreen}`} onClick={() => setTab("checklists")}>
                          View All
                        </button>
                      </div>
                      <table className={styles.listCardTable}>
                        <thead>
                          <tr>
                            <th>Target Car</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const recentChecklists = [...checklists]
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .slice(0, 6);

                            return recentChecklists.map((chk, i) => (
                              <tr key={chk.rc_id}>
                                <td>{getCarPlate(chk.car_id)}</td>
                                <td style={{ color: "#0f172a" }}>{new Date(chk.date).toLocaleDateString()}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ── Cars ────────────────── */}
              {tab === "cars" && !selectedCar && (
                <>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      All Cars · {filterRows(cars).length}
                    </div>
                    <button
                      id="add-car-btn"
                      className={styles.addBtn}
                      onClick={() => openAdd("cars")}
                    >
                      + Add
                    </button>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Plate</th>
                          <th>Model</th>
                          <th>Department</th>
                          <th>ERA #</th>
                          <th>Driver</th>
                          <th>Mileage</th>
                          <th>Serial #</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterRows(cars).map((c, i) => (
                          <tr key={c.car_id} onClick={() => setSelectedCar(c)}>
                            <td style={{ color: "#ccc" }}>{i + 1}</td>
                            <td>
                              <span className={styles.badgeOrange}>
                                {c.plate || "—"}
                              </span>
                            </td>
                            <td>{c.model || "—"}</td>
                            <td>{c.department || "—"}</td>
                            <td>{c.era_number || "—"}</td>
                            <td>{driverName(c)}</td>
                            <td>{c.mileage ?? "—"}</td>
                            <td>{c.serial_number || "—"}</td>
                          </tr>
                        ))}
                        {filterRows(cars).length === 0 && (
                          <tr>
                            <td colSpan={9}>
                              <div className={styles.emptyState}>
                                <div className={styles.emptyText}>
                                  {search
                                    ? "No matching cars"
                                    : "No cars registered"}
                                </div>
                                <div className={styles.emptyHint}>
                                  {search
                                    ? "Try a different search"
                                    : "Click + Add to register one"}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── Car Detail Panel ────── */}
              {tab === "cars" && selectedCar && (
                <div className={styles.carDetailPanel}>
                  <button className={styles.carDetailBack} onClick={() => setSelectedCar(null)}>
                    <ArrowLeft size={16} /> Back to list
                  </button>

                  {/* Hero */}
                  <div className={styles.carDetailHero}>
                    <div className={styles.carDetailPlate}>{selectedCar.plate || "—"}</div>
                    <div className={styles.carDetailHeroInfo}>
                      <div className={styles.carDetailModel}>{selectedCar.model || "Unknown Model"}</div>
                      <div className={styles.carDetailDept}>{selectedCar.department || "No Department"}</div>
                    </div>
                    <div className={styles.carDetailActions}>
                      <button className={styles.carDetailEditBtn} onClick={() => openEdit("cars", selectedCar)}>Edit</button>
                      <button className={styles.carDetailDeleteBtn} onClick={() => openDelete("cars", selectedCar)}>Delete</button>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className={styles.carDetailGrid}>
                    <div className={styles.carDetailCard}>
                      <div className={styles.carDetailCardTitle}>
                        <CarFront size={14} /> Vehicle Information
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Plate Number</span>
                        <span className={styles.carDetailVal}>{selectedCar.plate || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Model</span>
                        <span className={styles.carDetailVal}>{selectedCar.model || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>ERA Number</span>
                        <span className={styles.carDetailVal}>{selectedCar.era_number || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Engine Number</span>
                        <span className={styles.carDetailVal}>{selectedCar.engine_number || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Serial Number</span>
                        <span className={styles.carDetailVal}>{selectedCar.serial_number || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Mileage</span>
                        <span className={styles.carDetailVal}>{selectedCar.mileage ?? "—"}</span>
                      </div>
                    </div>

                    <div className={styles.carDetailCard}>
                      <div className={styles.carDetailCardTitle}>
                        <User size={14} /> Driver & Department
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Driver First Name</span>
                        <span className={styles.carDetailVal}>{selectedCar.driver_first_name || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Driver Last Name</span>
                        <span className={styles.carDetailVal}>{selectedCar.driver_last_name || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Department</span>
                        <span className={styles.carDetailVal}>{selectedCar.department || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Related Inspections & Checklists */}
                  <div className={styles.carDetailRelated}>
                    <div className={styles.carDetailRelatedTitle}>Related Inspections & Checklists</div>
                    {(() => {
                      const carInspections = inspections.filter(ins => ins.car_id === selectedCar.car_id);
                      const carChecklists = checklists.filter(chk => chk.car_id === selectedCar.car_id);
                      const allRelated = [
                        ...carInspections.map(ins => ({
                          kind: "inspection" as const,
                          id: ins.di_id,
                          date: ins.date,
                          label: `Inspection #${ins.di_id}`,
                          meta: `Mechanic: ${getMechName(ins.mechanic_id)} · Checklist RC-${ins.rc_id}`,
                        })),
                        ...carChecklists.map(chk => ({
                          kind: "checklist" as const,
                          id: chk.rc_id,
                          date: chk.date,
                          label: `Checklist #${chk.rc_id}`,
                          meta: `Technician: ${getTechName(chk.technician_id)}`,
                        })),
                      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                      if (allRelated.length === 0) {
                        return <div className={styles.carDetailEmpty}>No inspections or checklists found for this vehicle.</div>;
                      }

                      return (
                        <div className={styles.carDetailTimeline}>
                          {allRelated.map((item, i) => (
                            <div key={`${item.kind}-${item.id}-${i}`} className={styles.carDetailTimelineItem}>
                              <div className={`${styles.carDetailTimelineIcon} ${item.kind === "inspection" ? styles.carDetailTimelineIconInsp : styles.carDetailTimelineIconChk}`}>
                                {item.kind === "inspection" ? <FileSearch size={16} /> : <ClipboardList size={16} />}
                              </div>
                              <div className={styles.carDetailTimelineInfo}>
                                <div className={styles.carDetailTimelineLabel}>{item.label}</div>
                                <div className={styles.carDetailTimelineMeta}>{item.meta}</div>
                              </div>
                              <div className={styles.carDetailTimelineDate}>{item.date || "—"}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── Mechanics ───────────── */}
              {/* ── Mechanics ───────────── */}
              {tab === "mechanics" && !selectedMech && (
                <>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      All Mechanics · {filterRows(mechanics).length}
                    </div>
                    <button
                      id="add-mechanic-btn"
                      className={styles.addBtn}
                      onClick={() => openAdd("mechanics")}
                    >
                      + Add
                    </button>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Badge</th>
                          <th>Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterRows(mechanics).map((m, i) => (
                          <tr key={m.mechanic_id} onClick={() => setSelectedMech(m)}>
                            <td style={{ color: "#ccc" }}>{i + 1}</td>
                            <td>{m.first_name}</td>
                            <td>{m.last_name}</td>
                            <td>
                              <span className={styles.badgeGreen}>
                                {m.badge_number}
                              </span>
                            </td>
                            <td style={{ color: "#ccc", letterSpacing: 2 }}>
                              {"•".repeat(Math.min(m.password?.length || 4, 10))}
                            </td>
                          </tr>
                        ))}
                        {filterRows(mechanics).length === 0 && (
                          <tr>
                            <td colSpan={6}>
                              <div className={styles.emptyState}>
                                <div className={styles.emptyText}>
                                  No mechanics found
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── Mechanic Detail Panel ── */}
              {tab === "mechanics" && selectedMech && (
                <div className={styles.carDetailPanel}>
                  <button className={styles.carDetailBack} onClick={() => setSelectedMech(null)}>
                    <ArrowLeft size={16} /> Back to list
                  </button>

                  <div className={styles.carDetailHero}>
                    <div className={styles.carDetailPlate}>
                      {selectedMech.first_name?.charAt(0)}{selectedMech.last_name?.charAt(0)}
                    </div>
                    <div className={styles.carDetailHeroInfo}>
                      <div className={styles.carDetailModel}>
                        {selectedMech.first_name} {selectedMech.last_name}
                      </div>
                      <div className={styles.carDetailDept}>Mechanic · Badge {selectedMech.badge_number}</div>
                    </div>
                    <div className={styles.carDetailActions}>
                      <button className={styles.carDetailEditBtn} onClick={() => openEdit("mechanics", selectedMech)}>Edit</button>
                      <button className={styles.carDetailDeleteBtn} onClick={() => openDelete("mechanics", selectedMech)}>Delete</button>
                    </div>
                  </div>

                  <div className={styles.carDetailGrid}>
                    <div className={styles.carDetailCard}>
                      <div className={styles.carDetailCardTitle}>
                        <User size={14} /> Personal Information
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>First Name</span>
                        <span className={styles.carDetailVal}>{selectedMech.first_name || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Last Name</span>
                        <span className={styles.carDetailVal}>{selectedMech.last_name || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Badge Number</span>
                        <span className={styles.carDetailVal}>{selectedMech.badge_number || "—"}</span>
                      </div>
                    </div>

                    <div className={styles.carDetailCard}>
                      <div className={styles.carDetailCardTitle}>
                        <Wrench size={14} /> Work Summary
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Total Inspections</span>
                        <span className={styles.carDetailVal}>
                          {inspections.filter(ins => ins.mechanic_id === selectedMech.mechanic_id).length}
                        </span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Cars Inspected</span>
                        <span className={styles.carDetailVal}>
                          {new Set(inspections.filter(ins => ins.mechanic_id === selectedMech.mechanic_id).map(ins => ins.car_id)).size}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.carDetailRelated}>
                    <div className={styles.carDetailRelatedTitle}>Inspection History</div>
                    {(() => {
                      const mechInspections = inspections
                        .filter(ins => ins.mechanic_id === selectedMech.mechanic_id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                      if (mechInspections.length === 0) {
                        return <div className={styles.carDetailEmpty}>No inspections performed by this mechanic.</div>;
                      }

                      return (
                        <div className={styles.carDetailTimeline}>
                          {mechInspections.map((ins, i) => (
                            <div key={ins.di_id} className={styles.carDetailTimelineItem}>
                              <div className={`${styles.carDetailTimelineIcon} ${styles.carDetailTimelineIconInsp}`}>
                                <FileSearch size={16} />
                              </div>
                              <div className={styles.carDetailTimelineInfo}>
                                <div className={styles.carDetailTimelineLabel}>Inspection #{ins.di_id}</div>
                                <div className={styles.carDetailTimelineMeta}>
                                  Car: {getCarPlate(ins.car_id)} · Checklist RC-{ins.rc_id}
                                </div>
                              </div>
                              <div className={styles.carDetailTimelineDate}>{ins.date || "—"}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── Technicians ─────────── */}
              {tab === "technicians" && !selectedTech && (
                <>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      All Technicians · {filterRows(technicians).length}
                    </div>
                    <button
                      id="add-technician-btn"
                      className={styles.addBtn}
                      onClick={() => openAdd("technicians")}
                    >
                      + Add
                    </button>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Badge</th>
                          <th>Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterRows(technicians).map((t, i) => (
                          <tr key={t.technician_id} onClick={() => setSelectedTech(t)}>
                            <td style={{ color: "#ccc" }}>{i + 1}</td>
                            <td>{t.first_name}</td>
                            <td>{t.last_name}</td>
                            <td>
                              <span className={styles.badgeGreen}>
                                {t.badge_number}
                              </span>
                            </td>
                            <td style={{ color: "#ccc", letterSpacing: 2 }}>
                              {"•".repeat(Math.min(t.password?.length || 4, 10))}
                            </td>
                          </tr>
                        ))}
                        {filterRows(technicians).length === 0 && (
                          <tr>
                            <td colSpan={6}>
                              <div className={styles.emptyState}>
                                <div className={styles.emptyText}>
                                  No technicians found
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── Technician Detail Panel ── */}
              {tab === "technicians" && selectedTech && (
                <div className={styles.carDetailPanel}>
                  <button className={styles.carDetailBack} onClick={() => setSelectedTech(null)}>
                    <ArrowLeft size={16} /> Back to list
                  </button>

                  <div className={styles.carDetailHero}>
                    <div className={styles.carDetailPlate}>
                      {selectedTech.first_name?.charAt(0)}{selectedTech.last_name?.charAt(0)}
                    </div>
                    <div className={styles.carDetailHeroInfo}>
                      <div className={styles.carDetailModel}>
                        {selectedTech.first_name} {selectedTech.last_name}
                      </div>
                      <div className={styles.carDetailDept}>Technician · Badge {selectedTech.badge_number}</div>
                    </div>
                    <div className={styles.carDetailActions}>
                      <button className={styles.carDetailEditBtn} onClick={() => openEdit("technicians", selectedTech)}>Edit</button>
                      <button className={styles.carDetailDeleteBtn} onClick={() => openDelete("technicians", selectedTech)}>Delete</button>
                    </div>
                  </div>

                  <div className={styles.carDetailGrid}>
                    <div className={styles.carDetailCard}>
                      <div className={styles.carDetailCardTitle}>
                        <User size={14} /> Personal Information
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>First Name</span>
                        <span className={styles.carDetailVal}>{selectedTech.first_name || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Last Name</span>
                        <span className={styles.carDetailVal}>{selectedTech.last_name || "—"}</span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Badge Number</span>
                        <span className={styles.carDetailVal}>{selectedTech.badge_number || "—"}</span>
                      </div>
                    </div>

                    <div className={styles.carDetailCard}>
                      <div className={styles.carDetailCardTitle}>
                        <ClipboardList size={14} /> Work Summary
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Total Checklists</span>
                        <span className={styles.carDetailVal}>
                          {checklists.filter(chk => chk.technician_id === selectedTech.technician_id).length}
                        </span>
                      </div>
                      <div className={styles.carDetailRow}>
                        <span className={styles.carDetailKey}>Cars Checked</span>
                        <span className={styles.carDetailVal}>
                          {new Set(checklists.filter(chk => chk.technician_id === selectedTech.technician_id).map(chk => chk.car_id)).size}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.carDetailRelated}>
                    <div className={styles.carDetailRelatedTitle}>Checklist History</div>
                    {(() => {
                      const techChecklists = checklists
                        .filter(chk => chk.technician_id === selectedTech.technician_id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                      if (techChecklists.length === 0) {
                        return <div className={styles.carDetailEmpty}>No checklists performed by this technician.</div>;
                      }

                      return (
                        <div className={styles.carDetailTimeline}>
                          {techChecklists.map((chk) => (
                            <div key={chk.rc_id} className={styles.carDetailTimelineItem}>
                              <div className={`${styles.carDetailTimelineIcon} ${styles.carDetailTimelineIconChk}`}>
                                <ClipboardList size={16} />
                              </div>
                              <div className={styles.carDetailTimelineInfo}>
                                <div className={styles.carDetailTimelineLabel}>Checklist #{chk.rc_id}</div>
                                <div className={styles.carDetailTimelineMeta}>
                                  Car: {getCarPlate(chk.car_id)}
                                </div>
                              </div>
                              <div className={styles.carDetailTimelineDate}>{chk.date || "—"}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── Inspections ─────────── */}
              {tab === "inspections" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Detailed Inspections · {filterRows(inspections).length}
                    </div>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Linked Checklist ID</th>
                          <th>Date</th>
                          <th>Target Car Plate</th>
                          <th>Mechanic Assigned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterRows(inspections).map((ins) => (
                          <tr key={ins.di_id} style={{ cursor: "default" }}>
                            <td style={{ color: "#aaa" }}>#{ins.di_id}</td>
                            <td>
                              <span className={styles.badgeBlue}>
                                RC-{ins.rc_id}
                              </span>
                            </td>
                            <td>{new Date(ins.date).toLocaleDateString()}</td>
                            <td>{getCarPlate(ins.car_id)}</td>
                            <td>{getMechName(ins.mechanic_id)}</td>
                          </tr>
                        ))}
                        {filterRows(inspections).length === 0 && (
                          <tr>
                            <td colSpan={5}>
                              <div className={styles.emptyState}>
                                <div className={styles.emptyText}>
                                  No inspections found
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── Checklists ──────────── */}
              {tab === "checklists" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Receiving Checklists · {filterRows(checklists).length}
                    </div>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Checklist ID</th>
                          <th>Date</th>
                          <th>Target Car Plate</th>
                          <th>Technician Assigned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterRows(checklists).map((chk) => (
                          <tr key={chk.rc_id} style={{ cursor: "default" }}>
                            <td style={{ color: "#aaa" }}>RC-{chk.rc_id}</td>
                            <td>{new Date(chk.date).toLocaleDateString()}</td>
                            <td>{getCarPlate(chk.car_id)}</td>
                            <td>{getTechName(chk.technician_id)}</td>
                          </tr>
                        ))}
                        {filterRows(checklists).length === 0 && (
                          <tr>
                            <td colSpan={4}>
                              <div className={styles.emptyState}>
                                <div className={styles.emptyText}>
                                  No checklists found
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── Admin Accounts ──────── */}
              {tab === "admins" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Admin Accounts · {filterRows(admins).length}
                    </div>
                    <button
                      className={styles.addBtn}
                      onClick={() => openAdd("admins")}
                    >
                      + Add Admin
                    </button>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Username</th>
                          <th>Status</th>
                          <th style={{ width: 80 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterRows(admins).map((a, i) => (
                          <tr key={a.admin_id} style={{ cursor: "default" }}>
                            <td style={{ color: "#ccc" }}>{i + 1}</td>
                            <td>{a.username}</td>
                            <td>
                              {currentAdmin?.admin_id === a.admin_id ? (
                                <span className={styles.badgeGreen}>You</span>
                              ) : (
                                <span className={styles.badgeBlue}>Admin</span>
                              )}
                            </td>
                            <td>
                              {currentAdmin?.admin_id === a.admin_id && (
                                <button
                                  className={styles.deleteBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDelete("admins", a);
                                  }}
                                  title="Delete my account"
                                >
                                  ×
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filterRows(admins).length === 0 && (
                          <tr>
                            <td colSpan={4}>
                              <div className={styles.emptyState}>
                                <div className={styles.emptyText}>
                                  No admin accounts found
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── Admin Settings ──────── */}
              {tab === "admin" && (
                <div className={styles.adminPageWrapper}>
                  {/* Top Profile Card */}
                  <div className={styles.adminCard}>
                    <div className={styles.adminProfileHeader}>
                      <div className={styles.adminProfileInfo}>
                        <div className={styles.adminProfileAvatar}>A</div>
                        <div className={styles.adminProfileText}>
                          <div className={styles.adminProfileName}>Admin</div>
                          <div className={styles.adminProfileRoleGroup}>
                            <span className={styles.adminProfileRole}>ADMINISTRATOR</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        className={styles.primaryBtn} 
                        style={{ padding: "10px 20px", textTransform: "uppercase", fontSize: 11, letterSpacing: 1, borderRadius: 8 }}
                        onClick={() => {
                          if (isEditingAdmin) {
                            handleSaveAdmin();
                          } else {
                            setIsEditingAdmin(true);
                          }
                        }}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : isEditingAdmin ? "Save Profile" : "Edit Profile"}
                      </button>
                    </div>
                  </div>

                  {/* Administrative Info Card */}
                  <div className={styles.adminCard}>
                    <div className={styles.adminCardSectionHeader}>
                      <User size={16} strokeWidth={2.5} />
                      Administrative Info
                    </div>
                    <div className={styles.adminField}>
                      <div className={styles.adminFieldLabel}>User Name</div>
                      <input
                        className={styles.adminCardInput}
                        type="text"
                        value={formData.username || ""}
                        disabled={!isEditingAdmin}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Security & Password Card */}
                  <div className={styles.adminCard}>
                    <div className={styles.adminCardSectionHeader}>
                      <Key size={16} strokeWidth={2.5} />
                      Security & Password
                    </div>
                    <div className={styles.adminField}>
                      <input
                        className={styles.adminCardInput}
                        type="password"
                        value={formData.password || ""}
                        placeholder={isEditingAdmin ? "Enter new password" : "••••••••••"}
                        disabled={!isEditingAdmin}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Account Session Card */}
                  <div className={styles.adminCard}>
                    <div className={styles.adminSessionRow}>
                      <div className={styles.adminSessionText}>
                        <h4>Account Session</h4>
                        <p>Manage your current login session and security.</p>
                      </div>
                      <div className={styles.adminSessionActions}>
                        <button className={styles.deleteAccountBtn}>Delete my account</button>
                        <button className={styles.logoutSolidBtn} onClick={() => router.push("/admin/login")}>
                          <LogOut size={16} strokeWidth={2.5} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ──────────── */}
      {modal && (modal.type === "add" || modal.type === "edit") && modal.entity !== "admins" && (
        <div
          className={styles.modalOverlay}
          onClick={() => !saving && setModal(null)}
        >
          <div className={["cars", "mechanics", "technicians"].includes(modal.entity) ? styles.modalLarge : styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                {`${modal.type === "add" ? "New" : "Edit"} ${entityLabel[modal.entity as Tab]}`}
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setModal(null)}
              >
                ×
              </button>
            </div>
            <div className={["cars", "mechanics", "technicians"].includes(modal.entity) ? styles.modalBodyGrid : styles.modalBody}>
              {Object.keys(formData)
                .filter((key) => !(modal.entity === "cars" && ["driver_first_name", "driver_last_name", "department"].includes(key)))
                .map((key) => (
                <label key={key} className={styles.field}>
                  <span className={styles.fieldLabel}>
                    {fieldLabels[key] || key}
                  </span>
                  <input
                    id={`field-${key}`}
                    className={styles.fieldInput}
                    type={key === "password" ? "password" : "text"}
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [key]:
                          key === "mileage"
                            ? e.target.value.replace(/\D+/g, "")
                            : e.target.value,
                      }))
                    }
                    placeholder={`Enter ${(
                      fieldLabels[key] || key
                    ).toLowerCase()}`}
                  />
                </label>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.ghostBtn}
                onClick={() => setModal(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                id="modal-save-btn"
                className={styles.primaryBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : modal.type === "add"
                  ? "Create"
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Administrator Modal ───────── */}
      {modal && (modal.type === "add" || modal.type === "edit") && modal.entity === "admins" && (
        <div className={styles.modalOverlay} onClick={() => !saving && setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, padding: 32, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {modal.type === "add" ? "Add Administrator" : "Edit Administrator"}
              </div>
              <button 
                onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: 20 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Username</span>
                <input 
                  type="text" 
                  value={formData.username || ""}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: '#0f172a', width: '100%', boxSizing: 'border-box' }}
                  placeholder="Enter username"
                />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Password</span>
                <input 
                  type="password" 
                  value={formData.password || ""}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: '#0f172a', width: '100%', boxSizing: 'border-box' }}
                  placeholder="Enter password"
                />
              </label>

              <button 
                onClick={handleSave}
                disabled={saving}
                style={{ marginTop: 8, padding: '14px', borderRadius: 8, background: '#0f172a', color: '#fff', border: 'none', fontWeight: 500, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', width: '100%' }}
              >
                {saving ? "Saving..." : modal.type === "add" ? "Create Administrator" : "Save Administrator"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────── */}
      {modal && modal.type === "delete" && (
        <div
          className={styles.modalOverlay}
          onClick={() => !saving && setModal(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Confirm delete</div>
              <button
                className={styles.modalClose}
                onClick={() => setModal(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.confirmText}>
              Are you sure you want to delete{" "}
              <span className={styles.confirmHighlight}>
                {displayName(modal.entity, modal.data)}
              </span>
              ? This cannot be undone.
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.ghostBtn}
                onClick={() => setModal(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                id="modal-delete-btn"
                className={styles.dangerBtn}
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────── */}
      {toast && (
        <div
          className={
            toast.type === "success" ? styles.toastSuccess : styles.toastError
          }
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}
    </div>
  );
}
