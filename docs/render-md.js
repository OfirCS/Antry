(function () {
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function inline(s) {
    s = s.replace(/`([^`]+)`/g, function (_, c) { return '<code>' + esc(c) + '</code>'; });
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, t, u) {
      var safe = /^(https?:|mailto:|#|\/|\.\.?\/)/i.test(u) ? u : '#';
      return '<a href="' + esc(safe) + '" rel="noopener noreferrer">' + t + '</a>';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    return s;
  }

  function mdToHtml(text) {
    var lines = text.split('\n');
    var out = [];
    var i = 0;
    var inCode = false;
    var codeBuf = [];

    while (i < lines.length) {
      var line = lines[i];

      if (line.indexOf('```') === 0) {
        if (!inCode) { inCode = true; codeBuf = []; }
        else { inCode = false; out.push('<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>'); }
        i++; continue;
      }
      if (inCode) { codeBuf.push(line); i++; continue; }

      if (/^#{1,6}\s+/.test(line)) {
        var m = line.match(/^(#{1,6})\s+(.*)$/);
        var lvl = m[1].length;
        out.push('<h' + lvl + '>' + inline(esc(m[2])) + '</h' + lvl + '>');
        i++; continue;
      }
      if (/^---+\s*$/.test(line)) { out.push('<hr/>'); i++; continue; }

      if (/^>\s?/.test(line)) {
        var qbuf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { qbuf.push(lines[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote><p>' + inline(esc(qbuf.join(' '))) + '</p></blockquote>');
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var ulbuf = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          ulbuf.push('<li>' + inline(esc(lines[i].replace(/^\s*[-*]\s+/, ''))) + '</li>');
          i++;
        }
        out.push('<ul>' + ulbuf.join('') + '</ul>');
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var olbuf = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          olbuf.push('<li>' + inline(esc(lines[i].replace(/^\s*\d+\.\s+/, ''))) + '</li>');
          i++;
        }
        out.push('<ol>' + olbuf.join('') + '</ol>');
        continue;
      }
      if (line.trim() === '') { i++; continue; }

      var pbuf = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^(#{1,6}\s+|>\s|\s*[-*]\s+|\s*\d+\.\s+|```|---)/.test(lines[i])
      ) {
        pbuf.push(lines[i]);
        i++;
      }
      out.push('<p>' + inline(esc(pbuf.join(' '))) + '</p>');
    }
    return out.join('\n');
  }

  function render() {
    var mount = document.getElementById('md');
    if (!mount) return;
    var src = mount.getAttribute('data-src');
    if (!src) return;
    fetch(src).then(function (r) { return r.text(); }).then(function (text) {
      mount.innerHTML = mdToHtml(text);
      var title = text.match(/^#\s+(.+)$/m);
      if (title) document.title = title[1];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
