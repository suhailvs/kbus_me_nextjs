import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day — tune to how "live" you need this

function cacheKey(routeId, day) {
  return `routeDetails:${routeId}:${day}`;
}

function readCache(routeId, day) {
  try {
    const raw = localStorage.getItem(cacheKey(routeId, day));
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null; // stale
    return data;
  } catch {
    return null; // corrupted entry, ignore
  }
}

function writeCache(routeId, day, data) {
  try {
    localStorage.setItem(
      cacheKey(routeId, day),
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // localStorage full or unavailable (private browsing etc.) — fail silently
  }
}

// Only called from inside useEffect, so localStorage is always available here.
function fetchRouteDetails(routeId) {
  const days = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday",
  ];
  const day = days[new Date().getDay()];

  const cached = readCache(routeId, day);
  if (cached) return Promise.resolve(cached);

  return axios
    .get("https://chalo.com/app/api/scheduler_v4/v4/palakkad/routedetailslive", {
      params: { route_id: routeId, day },
    })
    .then((res) => {
      console.log(`Fetched route details for ${routeId} (${day}) from API`);
      writeCache(routeId, day, res.data);
      // save to django backend
      axios
        .post("https://kbus.stackschools.com/ajax_save_route_details/", res.data, {
          headers: { "Content-Type": "application/json" },
        })
        .catch(() => console.log("error to post to django"));
      return res.data;
    });
}

export default function RouteDetail({ data, routeId: routeIdProp }) {
  // Prop wins (MapPage passes it). Falls back to /route/[routeId] if you ever
  // use this component as a page.
  const router = useRouter();
  const routeId = routeIdProp ?? router.query.routeId;

  const [payload, setPayload] = useState(data || null);
  const [status, setStatus] = useState(data ? "ready" : "loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) return;
    if (!routeId) {
      // On a dynamic route, query is empty until the router is ready.
      if (routeIdProp === undefined && !router.isReady) return;
      setStatus("error");
      setError("No routeId provided.");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetchRouteDetails(routeId)
      .then((json) => {
        if (cancelled) return;
        setPayload(json);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [routeId, routeIdProp, router.isReady, data]);

  if (status === "loading") {
    return (
      <div className="container py-5 text-center text-secondary">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        Loading route…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container py-5">
        <div className="alert alert-danger mb-0">Couldn't load the route. {error}</div>
      </div>
    );
  }

  const route = payload.route;
  const stops = route.stopSequenceWithDetails || [];

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="card shadow-sm border-success-subtle">
        <div className="card-body">
          <p
            className="text-primary fw-semibold mb-1"
            style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}
          >
            {route.agency_name}:{" "}
            {route.subCategory
              ? `${route.subCategory}, ${route.serviceCategory}`
              : `${route.serviceCategory}`}
          </p>
          <p className="fw-bold mb-0 fs-5">
            {route.route_name}{" "}
            <small style={{ fontSize: "10px" }}>({route.route_id})</small>
          </p>
          {route.via && (
            <p className="text-secondary small mb-0" style={{ overflowWrap: "anywhere" }}>
              Via: <span className="text-body">{route.via}</span>
            </p>
          )}
          <hr className="my-3" />
          <ul className="list-group list-group-flush">
            {stops.map((stop, i) => {
              const isFirst = i === 0;
              const isLast = i === stops.length - 1;
              return (
                <li key={stop.stop_id || i} className="list-group-item px-0 py-0 border-0">
                  <div className="d-flex">
                    <div
                      className="d-flex flex-column align-items-center flex-shrink-0"
                      style={{ width: 28 }}
                    >
                      <span
                        className={
                          "rounded-circle border border-2 " +
                          (isFirst || isLast
                            ? "bg-success border-success"
                            : "bg-white border-secondary-subtle")
                        }
                        style={{
                          width: isFirst || isLast ? 14 : 10,
                          height: isFirst || isLast ? 14 : 10,
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      {!isLast && (
                        <div
                          className="border-start border-secondary-subtle flex-grow-1"
                          style={{ width: 0 }}
                        />
                      )}
                    </div>

                    <div className="flex-grow-1 pb-3 ps-3">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold">{stop.stop_name}</span>
                            {isFirst && (
                              <span className="badge text-bg-success-subtle text-success-emphasis">
                                Origin
                              </span>
                            )}
                            {isLast && (
                              <span className="badge text-bg-warning-subtle text-warning-emphasis">
                                Destination
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-secondary small font-monospace">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <br />
    </div>
  );
}
