/*
 * Page changes run in a view transition when React carries the foundations stack across
 * (SPEC section 12). The browser can give up on one: in a tab that draws no frames or whose
 * timers are throttled, the page change can outrun Chrome's 4 s limit ("Transition was aborted
 * because of timeout in DOM update"). React then reports the rejection, and Next reports it as
 * an uncaught error; and the zero-length animations React put on the root's view-transition
 * pseudo-elements stay on <html>, since React cancels them only once a transition is ready.
 *
 * So before React runs: every transition's promises are handled; a rejection that is the
 * browser aborting or skipping a transition (a DOMException) is marked handled when React
 * reports it; and once an aborted transition has settled, unless another has started since,
 * its leftover pseudo-element animations are cancelled (document.getAnimations() still lists
 * them once the pseudo-elements are gone; <html>'s own getAnimations() doesn't) and <html>
 * loses the view-transition-name React set on it. It is inline, with the head's first script,
 * so it is in place before React's first page change.
 */
const guard = `
(function (d) {
  var root = d.documentElement, start = d.startViewTransition, aborts = new WeakSet(), latest;
  if (!start) return;
  function mark(e) { if (e instanceof DOMException) aborts.add(e); }
  function tidy(t) {
    if (t !== latest || !d.getAnimations) return;
    d.getAnimations().forEach(function (a) {
      var p = a.effect && a.effect.target === root && a.effect.pseudoElement;
      if (p && p.indexOf("::view-transition") === 0) a.cancel();
    });
    if (root.style.viewTransitionName === "none") root.style.viewTransitionName = "";
  }
  d.startViewTransition = function () {
    var t = start.apply(d, arguments);
    var done = function () { tidy(t); };
    latest = t;
    t.ready.then(null, function (e) { mark(e); setTimeout(done); t.finished.then(done, done); });
    t.updateCallbackDone.then(null, mark);
    t.finished.then(null, mark);
    return t;
  };
  addEventListener("error", function (e) { if (aborts.has(e.error)) e.preventDefault(); });
  addEventListener("unhandledrejection", function (e) { if (aborts.has(e.reason)) e.preventDefault(); });
})(document);
`;

/** The guard as one line for the head's inline script. */
export const viewTransitionGuard = guard.replace(/\n\s*/g, "");
