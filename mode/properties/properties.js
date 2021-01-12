CodeMirror.defineMode("properties", () => ({
  token: function(stream, state) {
    var sol = stream.sol() || state.afterSection;
    var eol = stream.eol();

    state.afterSection = false;

    if (sol) {
      if (state.nextMultiline) {
        state.inMultiline = true;
        state.nextMultiline = false;
      } else {
        state.position = "def";
      }
    }

    if (eol && ! state.nextMultiline) {
      state.inMultiline = false;
      state.position = "def";
    }

    if (sol) {
      while(stream.eatSpace());
    }

    var ch = stream.next();

    if (sol && (ch === "#" || ch === "!" || ch === ";")) {
      state.position = "comment";
      stream.skipToEnd();
      return "comment";
    } else if (sol && ch === "[") {
      state.afterSection = true;
      stream.skipTo("]"); stream.eat("]");
      return "header";
    } else if (ch === "=" || ch === ":") {
      state.position = "quote";
      return null;
    } else if (ch === "\\" && state.position === "quote") {
      if (stream.next() !== "u") {    // u = Unicode sequence \u1234
        // Multiline value
        state.nextMultiline = true;
      }
    }

    return state.position;
  },

  startState: () => ({
    // Current position, "def", "quote" or "comment"
    position : "def",

    // Is the next line multiline value
    nextMultiline : false,

    // Is the current line a multiline value
    inMultiline : false,

    // Did we just open a section
    afterSection : false
  })
}));

CodeMirror.defineMIME("text/x-properties", "properties");
CodeMirror.defineMIME("text/x-ini", "properties");
