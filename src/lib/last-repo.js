// Last-selected GitHub repo, remembered across sessions in localStorage.
// Used so the artifact generator can link to the repo the user was last
// working with (memory manager, config manager, editor publish picker).
// Pure client-side helper — safe to import from any client component.

const KEY = "hc:lastRepo";

/** The last repo the user selected (owner/name), or null. */
export function getLastRepo() {
  try {
    const v = localStorage.getItem(KEY);
    return typeof v === "string" && v.includes("/") ? v : null;
  } catch {
    return null;
  }
}

/** Remember the repo the user selected (pass null/"" to forget). */
export function setLastRepo(repo) {
  try {
    const v = typeof repo === "string" ? repo.trim() : "";
    if (v.includes("/")) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {}
}

/** True when the repo list contains the remembered repo (the picker should
 *  only preselect repos the user can actually access). */
export function lastRepoIn(list) {
  const last = getLastRepo();
  return !!last && Array.isArray(list) && list.some((r) => r?.full_name === last);
}
