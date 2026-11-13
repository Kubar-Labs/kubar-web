/*
 * The error page's words, for the two error boundaries. They are client
 * components and can't read the messages on the server, and importing
 * messages/en.json would put the whole site's copy in every page's script.
 * site-contract.test.ts keeps these equal to messages.system.error.
 */
export const errorCopy = {
  title: "Something went wrong on our side · Kubar Labs",
  display: "Something went wrong on our side.",
  lineBefore: "Please try again in a moment. If it keeps happening, email ",
  email: "outreach@kubar.tech",
  lineAfter: ".",
};
