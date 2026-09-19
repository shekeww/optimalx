/*
 * optimalx-raed.js  v3
 *
 * The companion script to optimalx-raed.css. It is pasted into the Salla
 * design customiser's custom JavaScript box and runs on every page of
 * https://optimalx.com.sa (Raed theme). It builds only the DOM that the
 * approved product page needs and that Raed does not provide. Everything that
 * can be reached with a selector on Raed's own markup is the stylesheet's job,
 * not this file's.
 *
 * What it builds, by region (docs/design-target/pdp-target.png, target-spec C.2):
 *
 *   every page   the utility bar's three trust items and the country label,
 *                the search field moved into the main nav row, the header's
 *                wishlist button, the footer's registration block
 *   product      the thumbnail rail, the plate badge and zoom affordance, the
 *                brand line, the rating row, the four statistic cards, the
 *                payment marks, the delivery pill, the three trust items, the
 *                dark brand band, the anchor strip with its scrollspy, the
 *                three information panels (details, method, nutrition), the
 *                nutrition disclosure, the supply calculator, and the mobile
 *                bottom bar's price mirror
 *
 * Rules this file keeps, without exception:
 *
 *   - ONE claims gate. Every builder asks can('name') before it appends. A
 *     gate whose data is absent returns false and the element is not built.
 *     No rating, no count, no delivery day, no threshold, no percentage and
 *     no popularity claim is ever written into this file as a literal.
 *   - Every feature runs inside its own try/catch and is idempotent: it marks
 *     what it built with data-ox and does nothing on a second run.
 *   - Every anchor is found by structure (class, attribute, component name),
 *     never by nth-child. A missing anchor means the feature does nothing.
 *   - Arabic copy is approved copy from locales/ar.json (the ox.* namespace)
 *     or FINAL-content.md. Modern Standard Arabic, no diacritics, no dialect,
 *     no em-dash anywhere.
 *   - Facts are read, never authored: the spec line, the nutrition table and
 *     the method paragraph are parsed out of the merchant's own description;
 *     the store's country, gateways, commercial register and tax number are
 *     read out of Salla's own twilight::init payload.
 *
 * The parsing and the arithmetic are ports of the theme's tested modules:
 * app/components/product/lib/specLine.ts and supply.ts.
 *
 * This file is a stopgap until the OptimalX React theme passes Salla review,
 * at which point it and the stylesheet are deleted rather than maintained.
 */
(function () {
  'use strict';

  var V = '3.0.0';
  var W = window;
  var D = document;
  if (W.__oxSkin === V) return;
  W.__oxSkin = V;

  var MK = 'data-ox';
  var NS = 'http://www.w3.org/2000/svg';
  var BAND_PHOTO =
    'https://raw.githubusercontent.com/shekeww/optimalx/docs/engine-defect-and-spec-trueup/docs/assets/athlete-back.jpg';

  /* ------------------------------------------------------------------ *
   * 1. Small DOM helpers.
   * ------------------------------------------------------------------ */

  function q(s, r) {
    try {
      return (r || D).querySelector(s);
    } catch (e) {
      return null;
    }
  }

  function qa(s, r) {
    try {
      return [].slice.call((r || D).querySelectorAll(s));
    } catch (e) {
      return [];
    }
  }

  function E(tag, cls, text) {
    var e = D.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== '') e.textContent = text;
    return e;
  }

  function A(parent, child) {
    parent.appendChild(child);
    return child;
  }

  /** Latin or mixed runs sit in a bdi so the bidi algorithm leaves them alone. */
  function bdi(text) {
    var e = D.createElement('bdi');
    e.textContent = text;
    return e;
  }

  /** A number in a bdi with an explicit ltr direction: registers, SKUs. */
  function ltr(text) {
    var e = bdi(text);
    e.setAttribute('dir', 'ltr');
    return e;
  }

  function txt(node) {
    return node && node.textContent ? node.textContent.trim() : '';
  }

  function done(el, name) {
    el.setAttribute(MK, name);
    return el;
  }

  function built(name) {
    return q('[' + MK + '="' + name + '"]') !== null;
  }

  /** A finite positive number out of anything, or null. */
  function num(v) {
    if (v == null) return null;
    var n = typeof v === 'number' ? v : parseFloat(String(v));
    return isFinite(n) ? n : null;
  }

  function fill(template, token, value) {
    return String(template).split('{{' + token + '}}').join(String(value));
  }

  /* ------------------------------------------------------------------ *
   * 2. Icons. One table of path data, one factory. Stroke geometry unless
   *    the value starts with "!", which means a filled mark.
   * ------------------------------------------------------------------ */

  var IC = {
    shield: 'M12 3l7 3v5.6c0 4-3 6.6-7 8.4-4-1.8-7-4.4-7-8.4V6zM9 11.6l2.1 2.1 3.9-4',
    lock: 'M6 11h12v9H6zM9 11V8.2A3 3 0 0 1 15 8.2V11',
    truck: 'M3 6h11v10H3zM14 9.5h3.6l2.4 3V16H14zM7 19.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM17.4 19.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z',
    chev: 'M6 9l6 6 6-6',
    leaf: 'M20 4C10 4 4.5 8.6 4.5 15.4c0 1.8.7 3.2.7 3.2S7.4 9.4 20 6.4M5.2 19.6C8.4 13 13.4 9.6 19.4 8.6',
    zoom: 'M4 9.5V4h5.5M20 14.5V20h-5.5M14.5 4H20v5.5M9.5 20H4v-5.5',
    star: '!M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z',
    cart: 'M6 8h12l-1 12H7zM9 8V6.2A3 3 0 0 1 15 6.2V8',
    heart: 'M12 20.2S4.8 15.8 4.8 11.2A3.9 3.9 0 0 1 12 8.9a3.9 3.9 0 0 1 7.2 2.3c0 4.6-7.2 9-7.2 9z',
    plus: 'M12 6.5v11M6.5 12h11',
    cup: 'M6.5 7h11l-1.4 12.5h-8.2zM9.5 4h5M8.5 11h7',
    shaker: 'M8.6 3.5h6.8l-.8 3.5H9.4zM7.4 7h9.2l-1 12.5H8.4z',
    straw: 'M8 7.5h8l-1 12h-6zM14.5 3.5l-2 4',
    nosugar: 'M5 8.5h14v7H5zM4 20L20 4',
    nogluten: 'M12 4.5v15M12 9c-1.6-1.8-3.6-1.8-3.6-1.8S8.6 9.4 10.2 11M12 13c-1.6-1.8-3.6-1.8-3.6-1.8s.2 2.2 1.8 3.8M4 20L20 4',
    search: 'M11 4.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6zM20 20l-4.2-4.2'
  };

  function icon(name, size, cls) {
    var d = IC[name];
    if (!d) return null;
    var filled = d.charAt(0) === '!';
    if (filled) d = d.slice(1);
    var svg = D.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'ox-i' + (cls ? ' ' + cls : ''));
    if (filled) {
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('stroke', 'none');
    } else {
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.6');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
    }
    var p = D.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
    return svg;
  }

  /* ------------------------------------------------------------------ *
   * 3. The store's own data.
   *
   *    Salla prints its whole configuration into the page as the payload of
   *    salla.event.dispatchEvents({"twilight::init": ... }). That payload is
   *    synchronous and always present, so nothing here waits for hydration.
   *    salla.config.get is preferred when the runtime is already up.
   * ------------------------------------------------------------------ */

  var ROOT;

  function root() {
    if (ROOT !== undefined) return ROOT;
    ROOT = null;
    try {
      var ss = D.getElementsByTagName('script');
      for (var i = 0; i < ss.length; i += 1) {
        var t = ss[i].textContent || '';
        if (t.indexOf('twilight::init') < 0) continue;
        var call = t.indexOf('dispatchEvents(');
        if (call < 0) continue;
        var start = t.indexOf('{', call);
        if (start < 0) continue;
        var depth = 0;
        var inStr = false;
        var esc = false;
        for (var j = start; j < t.length; j += 1) {
          var c = t.charAt(j);
          if (esc) {
            esc = false;
            continue;
          }
          if (c === '\\') {
            esc = true;
            continue;
          }
          if (inStr) {
            if (c === '"') inStr = false;
            continue;
          }
          if (c === '"') {
            inStr = true;
            continue;
          }
          if (c === '{') depth += 1;
          else if (c === '}') {
            depth -= 1;
            if (depth === 0) {
              ROOT = JSON.parse(t.slice(start, j + 1))['twilight::init'] || null;
              break;
            }
          }
        }
        if (ROOT) break;
      }
    } catch (e) {
      ROOT = null;
    }
    return ROOT;
  }

  function cfg(path) {
    try {
      if (W.salla && W.salla.config && W.salla.config.get) {
        var live = W.salla.config.get(path);
        if (live !== undefined && live !== null && live !== '') return live;
      }
    } catch (e) {
      /* the runtime is not up yet; the payload below still answers */
    }
    try {
      var o = root();
      var p = path.split('.');
      for (var i = 0; i < p.length; i += 1) {
        if (o == null) return null;
        o = o[p[i]];
      }
      return o === undefined || o === '' ? null : o;
    } catch (e) {
      return null;
    }
  }

  /** The Product node of the page's own JSON-LD, or null. */
  var LD;

  function ld() {
    if (LD !== undefined) return LD;
    LD = null;
    try {
      var ss = qa('script[type="application/ld+json"]');
      for (var i = 0; i < ss.length && !LD; i += 1) {
        var o = JSON.parse(ss[i].textContent || 'null');
        if (!o) continue;
        var g = o['@graph'] || [o];
        for (var j = 0; j < g.length; j += 1) {
          if (g[j] && g[j]['@type'] === 'Product') {
            LD = g[j];
            break;
          }
        }
      }
    } catch (e) {
      LD = null;
    }
    return LD;
  }

  function ratingCount() {
    var p = ld();
    var agg = p && p.aggregateRating;
    var n = agg ? num(agg.ratingCount != null ? agg.ratingCount : agg.reviewCount) : null;
    if (n != null) return n;
    var e = q('salla-rating-stars[rating-count],[data-rating-count]');
    if (e) {
      n = num(e.getAttribute('rating-count') || e.getAttribute('data-rating-count'));
      if (n != null) return n;
    }
    return 0;
  }

  function ratingValue() {
    var p = ld();
    return p && p.aggregateRating ? num(p.aggregateRating.ratingValue) : null;
  }

  function brandName() {
    var p = ld();
    var b = p && p.brand;
    if (!b) return null;
    var name = typeof b === 'string' ? b : b.name;
    return name ? String(name).trim() || null : null;
  }

  /* ------------------------------------------------------------------ *
   * 4. The claims gate.
   *
   *    Every builder calls can(name) before it appends, so every gated
   *    element in the design is switched on from one table and nowhere else.
   *    An unknown name is false: a new element cannot ship ungated by
   *    accident. A gate that throws is false for the same reason.
   * ------------------------------------------------------------------ */

  var GATE = {
    /* The product's own rating count, from its structured data. */
    rating: function () {
      return ratingCount() > 0;
    },
    /* A real platform promotion or label on this product, never a guess. */
    bestseller: function () {
      return !!q('.product-promotion-title,[data-promotion-title],.s-product-card-promotion-title');
    },
    /* A configured shipping estimate window. */
    delivery: function () {
      return !!deliveryText();
    },
    /* Branch pickup, which the delivery pill falls back to. */
    pickup: function () {
      return cfg('store.shipping.support_pickup') === true || cfg('store.support_pickup') === true;
    },
    /* A city chooser the customer can actually open. */
    city: function () {
      return !!q('salla-cities-modal,#cities-modal,salla-localization-modal');
    },
    /* A shipping company that reports tracking. */
    tracking: function () {
      var s = cfg('store.shipping.tracking_enabled');
      return s === true;
    },
    /* Gateways enabled on the store. */
    pay: function () {
      var p = cfg('store.settings.payments');
      return !!(p && p.length);
    },
    /* The brand the catalogue records on this product. */
    brand: function () {
      return !!brandName();
    },
    /* Raed's own latin sub-title element, non-empty. */
    subtitle: function () {
      return !!txt(q('h2.product-entry__sub-title'));
    },
    /* The commercial register recorded in the dashboard. */
    cr: function () {
      return !!cfg('store.settings.commercial_number');
    },
    /* The VAT number recorded in the dashboard. It is not set today. */
    vat: function () {
      return !!cfg('store.settings.tax.number');
    },
    /* Prices may only be called VAT inclusive when the store is registered. */
    vatline: function () {
      return !!cfg('store.settings.tax.number') && cfg('store.settings.tax.taxable_prices_enabled') === true;
    },
    /* Reviews exist. */
    reviews: function () {
      return ratingCount() > 0;
    },
    /* The label printed an expiry, which is what the authenticity line says. */
    expiry: function () {
      var s = spec();
      return !!(s && s.expiryText);
    }
  };

  function can(name) {
    try {
      var g = GATE[name];
      return g ? g() === true : false;
    } catch (e) {
      return false;
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. Which page is this?
   * ------------------------------------------------------------------ */

  function bodyHas(name) {
    return D.body ? D.body.classList.contains(name) : false;
  }

  function isProduct() {
    return bodyHas('product-single');
  }

  /* ------------------------------------------------------------------ *
   * 6. The description, read apart.
   *
   *    The catalogue's convention, verified against all 47 descriptions:
   *    a spec line paragraph, prose paragraphs, the label's nutrition table,
   *    a paragraph opening "طريقة الاستخدام:" and one opening "تنبيه:".
   *
   *    Ports of specLine.ts. No regular expressions: string scanning only.
   * ------------------------------------------------------------------ */

  var L_SERVINGS = 'الحصص';
  var L_SIZE = 'حجم الحصة';
  var L_EXPIRY = 'الصلاحية';
  var L_FORM = 'الشكل';
  var P_USE = 'طريقة الاستخدام';

  function descEl() {
    return q('.product__description .article--main') || q('.product__description');
  }

  function paras() {
    var d = descEl();
    return d ? qa('p', d) : [];
  }

  function descText() {
    var d = descEl();
    return d ? txt(d) : '';
  }

  function splitPair(chunk) {
    var at = chunk.indexOf(':');
    if (at < 0) at = chunk.indexOf('؛');
    if (at < 0) return null;
    var label = chunk.slice(0, at).trim();
    var value = chunk.slice(at + 1).trim();
    if (!label || !value) return null;
    return { l: label, v: value };
  }

  function leadInt(value) {
    var digits = '';
    for (var i = 0; i < value.length; i += 1) {
      var c = value.charCodeAt(i);
      if (c < 48 || c > 57) break;
      digits += value.charAt(i);
    }
    if (!digits) return null;
    var n = parseInt(digits, 10);
    return isFinite(n) && n > 0 ? n : null;
  }

  function isYearMonth(value) {
    if (!value || value.length !== 7) return false;
    for (var i = 0; i < 7; i += 1) {
      var c = value.charCodeAt(i);
      if (i === 4) {
        if (c !== 45) return false;
      } else if (c < 48 || c > 57) return false;
    }
    return true;
  }

  var SPEC;

  function spec() {
    if (SPEC !== undefined) return SPEC;
    SPEC = null;
    try {
      var ps = paras();
      if (!ps.length) return SPEC;
      var line = txt(ps[0]);
      var parts = line.split('|');
      var fields = [];
      for (var i = 0; i < parts.length; i += 1) {
        var pair = splitPair(parts[i]);
        if (pair) fields.push(pair);
      }
      if (!fields.length) return SPEC;
      var get = function (label) {
        for (var k = 0; k < fields.length; k += 1) if (fields[k].l === label) return fields[k].v;
        return null;
      };
      var servings = get(L_SERVINGS);
      var expiry = get(L_EXPIRY);
      SPEC = {
        fields: fields,
        servingsText: servings,
        servings: servings == null ? null : leadInt(servings),
        servingSize: get(L_SIZE),
        expiryText: expiry,
        expiry: expiry && isYearMonth(expiry) ? expiry : null,
        form: get(L_FORM)
      };
    } catch (e) {
      SPEC = null;
    }
    return SPEC;
  }

  /** The description's second paragraph is the prose the buy column shows. */
  function prose() {
    var ps = paras();
    for (var i = 1; i < ps.length; i += 1) {
      var t = txt(ps[i]);
      if (t && t.indexOf(P_USE) !== 0 && t.indexOf('تنبيه') !== 0) return t;
    }
    return '';
  }

  var NUT;

  function nutrition() {
    if (NUT !== undefined) return NUT;
    NUT = null;
    try {
      var d = descEl();
      var table = d ? q('table', d) : null;
      if (!table) return NUT;
      var rows = qa('tr', table);
      var head = null;
      var out = [];
      for (var i = 0; i < rows.length; i += 1) {
        var cells = qa('th,td', rows[i]);
        if (cells.length < 2) continue;
        var k = txt(cells[0]);
        var v = txt(cells[1]);
        if (!k || !v) continue;
        if (!head && cells[0].tagName === 'TH') {
          head = { k: k, v: v };
          continue;
        }
        out.push({ k: k, v: v });
      }
      if (out.length) NUT = { head: head, rows: out };
    } catch (e) {
      NUT = null;
    }
    return NUT;
  }

  /** The value of the first row whose nutrient name starts with one of these. */
  function nutrientOf(names) {
    var n = nutrition();
    if (!n) return null;
    for (var i = 0; i < n.rows.length; i += 1) {
      for (var j = 0; j < names.length; j += 1) {
        if (n.rows[i].k.indexOf(names[j]) === 0) return n.rows[i];
      }
    }
    return null;
  }

  /** The method paragraph, split on the sentence stop. */
  function steps() {
    var ps = paras();
    for (var i = 0; i < ps.length; i += 1) {
      var t = txt(ps[i]);
      if (t.indexOf(P_USE) !== 0) continue;
      var at = t.indexOf(':');
      if (at < 0) at = t.indexOf('؛');
      var body = at < 0 ? '' : t.slice(at + 1).trim();
      var out = [];
      var cur = '';
      for (var j = 0; j < body.length; j += 1) {
        var c = body.charAt(j);
        if (c === '.' || c === '۔') {
          if (cur.trim()) out.push(cur.trim());
          cur = '';
        } else cur += c;
      }
      if (cur.trim()) out.push(cur.trim());
      return out;
    }
    return [];
  }

  /**
   * A printed size out of a string: a number, then one of the label units.
   * Longest units first so "كجم" is never read as "جم". Returns the merchant's
   * own text ("1 كجم"), never a converted or computed figure.
   */
  var UNITS = ['كجم', 'كغم', 'جرام', 'غرام', 'لتر', 'جم', 'غم', 'مل', 'kg', 'ml', 'g'];
  var AFTER = [' ', '-', ',', '،', ')', '.', '', '|'];

  function sizeIn(text) {
    if (!text) return null;
    for (var i = 0; i < text.length; i += 1) {
      var c = text.charCodeAt(i);
      if (c < 48 || c > 57) continue;
      if (i > 0) {
        var p = text.charCodeAt(i - 1);
        if ((p >= 48 && p <= 57) || p === 46) continue;
      }
      var j = i;
      while (j < text.length) {
        var d = text.charCodeAt(j);
        if (d >= 48 && d <= 57) {
          j += 1;
          continue;
        }
        if (d === 46 && j + 1 < text.length && text.charCodeAt(j + 1) >= 48 && text.charCodeAt(j + 1) <= 57) {
          j += 1;
          continue;
        }
        break;
      }
      var digits = text.slice(i, j);
      var k = j;
      while (text.charAt(k) === ' ') k += 1;
      for (var u = 0; u < UNITS.length; u += 1) {
        var unit = UNITS[u];
        if (text.substr(k, unit.length) !== unit) continue;
        if (AFTER.indexOf(text.charAt(k + unit.length)) >= 0) return digits + ' ' + unit;
      }
    }
    return null;
  }

  /** The pack size the merchant printed, from the spec line then the title. */
  function packSize() {
    var s = spec();
    if (s) {
      for (var i = 0; i < s.fields.length; i += 1) {
        var f = s.fields[i];
        if (f.l === 'الحجم' || f.l === 'حجم العبوة' || f.l === 'الوزن') return f.v;
      }
    }
    return sizeIn(txt(q('h1[data-testid="store-product-title"]') || q('.main-content h1')));
  }

  /**
   * Facts the merchant stated in the description, for the band badges and the
   * statistic row's diet cell. Each one needs its phrase written out; nothing
   * is inferred from a product name and nothing is inferred from a number.
   */
  var FACTS = [
    { id: 'vegan', ar: 'نباتي', la: 'Vegan', ic: 'leaf', say: ['نباتي', 'نباتية'], not: ['غير نباتي'] },
    {
      id: 'sugar',
      ar: 'بدون سكر مضاف',
      la: 'No Added Sugar',
      ic: 'nosugar',
      say: ['بدون سكر مضاف', 'دون سكر مضاف', 'خالي من السكر', 'بلا سكر مضاف'],
      not: []
    },
    {
      id: 'gluten',
      ar: 'خالي من الغلوتين',
      la: 'Gluten Free',
      ic: 'nogluten',
      say: ['خالي من الغلوتين', 'خالي من الجلوتين', 'خال من الغلوتين', 'خال من الجلوتين'],
      not: ['يحتوي على الغلوتين', 'يحتوي على الجلوتين']
    }
  ];

  function statedFacts() {
    var text = descText();
    var out = [];
    if (!text) return out;
    for (var i = 0; i < FACTS.length; i += 1) {
      var f = FACTS[i];
      var blocked = false;
      for (var n = 0; n < f.not.length; n += 1) if (text.indexOf(f.not[n]) >= 0) blocked = true;
      if (blocked) continue;
      for (var s = 0; s < f.say.length; s += 1) {
        if (text.indexOf(f.say[s]) >= 0) {
          out.push(f);
          break;
        }
      }
    }
    return out;
  }

  function hasFact(id) {
    var f = statedFacts();
    for (var i = 0; i < f.length; i += 1) if (f[i].id === id) return true;
    return false;
  }

  /* ------------------------------------------------------------------ *
   * 7. The supply arithmetic (port of supply.ts). It describes the package,
   *    never a person, and computes nothing when the label printed no count.
   * ------------------------------------------------------------------ */

  function clampDose(dose) {
    if (!isFinite(dose)) return 1;
    var whole = Math.floor(dose);
    if (whole < 1) return 1;
    if (whole > 4) return 4;
    return whole;
  }

  function supplyDays(servings, dose) {
    if (typeof servings !== 'number' || !isFinite(servings) || servings <= 0) return null;
    var days = Math.floor(servings / clampDose(dose));
    return days < 1 ? null : days;
  }

  /* ------------------------------------------------------------------ *
   * 8. Approved copy. Every string below is in locales/ar.json under ox.*
   *    or in FINAL-content.md, except the six interface labels marked NEW,
   *    which the approved design introduces and which carry no claim.
   * ------------------------------------------------------------------ */

  var T = {
    authentic: 'منتجات أصلية',
    authentic_line: 'صلاحية واضحة على كل منتج',
    payment: 'دفع آمن',
    payment_marks: 'طرق الدفع المتاحة',
    shipping: 'شحن من المدينة المنورة',
    shipping_line: 'إلى كل مدينة في السعودية',
    wishlist: 'المفضلة',
    rating_count: '{{count}} تقييما',
    delivery_estimate: 'موعد التوصيل المتوقع',
    pickup_free: 'استلام مجاني من فرع الخالدية',
    change_city: 'تغيير المدينة' /* NEW */,
    zoom: 'تكبير الصورة' /* NEW */,
    bestseller: 'الأكثر مبيعا' /* NEW */,
    facts: 'تفاصيل المنتج',
    how_to_use: 'طريقة الاستخدام',
    nutrition_title: 'الحقائق الغذائية',
    reviews: 'التقييمات',
    show_all: 'عرض جميع القيم الغذائية' /* NEW */,
    label_note: 'الأرقام منقولة من ملصق المنتج، وليست توصية لأي شخص بعينه.',
    per_serving: 'في الحصة',
    size: 'الحجم',
    servings: 'عدد الحصص',
    serving_size: 'حجم الحصة',
    expiry: 'الصلاحية',
    form: 'الشكل',
    brand: 'العلامة',
    sku: 'رقم المنتج' /* NEW */,
    cr: 'سجل تجاري رقم',
    vat: 'الرقم الضريبي',
    supply_title: 'كم يوما تكفي العبوة؟',
    supply_days: 'تكفي نحو {{days}} يوما',
    supply_per_day: 'حصص في اليوم',
    supply_note: 'حساب تقريبي من عدد الحصص على الملصق، وليس توصية بجرعة.',
    supply_more: 'زيادة الحصص في اليوم',
    supply_less: 'إنقاص الحصص في اليوم',
    gallery_image: 'صورة {{index}} من {{total}}',
    prev: 'السابق',
    next: 'التالي'
  };

  /* The store's own country, named. A code with no entry renders nothing. */
  var COUNTRIES = {
    SA: 'السعودية',
    AE: 'الإمارات',
    KW: 'الكويت',
    BH: 'البحرين',
    QA: 'قطر',
    OM: 'عمان',
    EG: 'مصر'
  };

  /* ------------------------------------------------------------------ *
   * 9. The baseline stylesheet.
   *
   *    NOT the skin. optimalx-raed.css is the skin and it lives in the custom
   *    CSS box. This is the floor under the sections this script builds, so
   *    they are never unstyled markup: it is injected as the FIRST child of
   *    <head>, and the real stylesheet, which arrives later in the document,
   *    wins every rule it cares to write.
   * ------------------------------------------------------------------ */

  var BASE = `
:root{
--ox-accent:#EE4D22;--ox-verify:#14514C;--ox-paper:#F9F5EE;--ox-plate:#F1E9E1;--ox-card:#FBF8F3;
--ox-ink:#17171A;--ox-ink-2:#5A5A61;--ox-ink-3:#6F6F78;--ox-ink-4:#9A9AA3;
--ox-ink-on-dark:#F7F4EE;--ox-ink-2-on-dark:#B9B9C1;--ox-ink-3-on-dark:#8A8D8E;
--ox-line:#EFEBE4;--ox-line-2:#EEEBE3;--ox-dark:#0E1117;--ox-r:16px;
--ox-dur:180ms;--ox-ease:cubic-bezier(.4,0,.2,1);
}
.ox-i{flex:none;}
salla-slider.details-slider{position:relative;display:block;}
.ox-gal{display:flex;align-items:flex-start;gap:20px;}
.ox-gal>salla-slider{flex:1 1 auto;min-width:0;}
[dir=rtl] .ox-chev{transform:scaleX(-1);}
.ox-util{display:flex;align-items:center;gap:60px;}
.ox-util__it{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ox-ink-3-on-dark);}
.ox-country{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--ox-ink-3-on-dark);background:none;border:0;padding:0;}
.ox-wish{position:relative;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;color:inherit;}
.ox-count{position:absolute;inset-block-start:-4px;inset-inline-end:-4px;min-width:16px;height:16px;border-radius:999px;background:var(--ox-accent);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;}
.ox-rail{display:flex;flex-direction:column;align-items:center;gap:12px;width:64px;flex:none;}
.ox-rail__list{display:flex;flex-direction:column;gap:12px;overflow:hidden;max-height:324px;scroll-behavior:smooth;}
.ox-rail__b{width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:none;border:0;color:var(--ox-ink-4);cursor:pointer;}
.ox-thumb{width:64px;height:72px;border-radius:6px;background:var(--ox-plate);border:2px solid transparent;padding:6px;cursor:pointer;display:block;}
.ox-thumb img{width:100%;height:100%;object-fit:contain;display:block;}
.ox-thumb.is-on{border-color:var(--ox-accent);}
.ox-badge-top{position:absolute;inset-block-start:20px;inset-inline-start:16px;height:28px;padding:0 14px;border-radius:999px;background:#14181F;color:var(--ox-ink-on-dark);font-size:12px;font-weight:700;display:inline-flex;align-items:center;z-index:2;}
.ox-zoom{position:absolute;inset-block-end:20px;inset-inline-start:22px;display:inline-flex;align-items:center;gap:12px;background:none;border:0;padding:0;color:var(--ox-ink-4);font-size:13px;font-weight:500;cursor:pointer;z-index:2;}
.ox-brandline{display:block;font-size:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ox-ink-2);margin-bottom:6px;}
.ox-rating{display:flex;align-items:center;height:30px;margin-bottom:18px;}
.ox-rating__s{display:flex;align-items:center;gap:6px;color:#D2D2D8;}
.ox-star.is-on{color:var(--ox-accent);}
.ox-rating__v{margin-inline-start:12px;font-size:16px;font-weight:700;color:var(--ox-ink);}
.ox-rating__c{margin-inline-start:14px;font-size:14px;color:var(--ox-ink-4);}
.ox-stats{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;align-items:center;height:70px;margin:6px 0 22px;}
.ox-stat{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;}
.ox-stat+.ox-stat{border-inline-start:1px solid var(--ox-line);}
.ox-stat__v{font-size:22px;font-weight:800;color:var(--ox-ink);line-height:1;}
.ox-stat__l{font-size:13px;font-weight:500;line-height:16px;color:var(--ox-ink-4);}
.ox-stat__l span{display:block;}
.ox-pay{display:flex;align-items:center;gap:20px;min-height:21px;margin:15px 0;}
.ox-pay salla-payments{display:block;}
.ox-deliver{display:flex;align-items:center;gap:10px;width:100%;min-height:52px;border-radius:12px;background:#F3EEE8;border:0;padding:0 16px;color:var(--ox-verify);font-size:15px;font-weight:600;text-align:start;cursor:pointer;}
.ox-deliver__c{margin-inline-start:auto;font-size:14px;font-weight:500;color:var(--ox-ink-4);}
.ox-trust{display:flex;align-items:stretch;justify-content:space-between;min-height:45px;margin-top:39px;}
.ox-trust__it{display:flex;align-items:center;gap:12px;flex:1;padding-inline:14px;color:var(--ox-verify);}
.ox-trust__it+.ox-trust__it{border-inline-start:1px solid var(--ox-line);}
.ox-trust__it:first-child{padding-inline-start:0;}
.ox-trust__it:last-child{padding-inline-end:0;}
.ox-trust__t{font-size:14px;font-weight:700;color:var(--ox-ink);display:block;}
.ox-trust__s{font-size:13px;color:var(--ox-ink-4);display:block;margin-top:2px;}
.ox-band{position:relative;overflow:hidden;border-radius:6px;background:var(--ox-dark);min-height:252px;display:flex;align-items:center;padding:40px;margin-top:40px;}
.ox-band__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;}
.ox-band__v1,.ox-band__v2{position:absolute;inset:0;pointer-events:none;}
.ox-band__v1{background:linear-gradient(to left,#0E1117 0%,#0E1117 26%,rgba(14,17,23,.72) 48%,rgba(14,17,23,.25) 72%,rgba(14,17,23,.55) 100%);}
.ox-band__v2{background:rgba(14,17,23,.35);}
.ox-band__w{position:absolute;inset-block:0;inset-inline-end:48px;width:26px;background:var(--ox-accent);transform:skewX(-22deg);pointer-events:none;}
.ox-band__w2{position:absolute;inset-block:0;inset-inline-end:96px;width:14px;background:var(--ox-accent);transform:skewX(-22deg);pointer-events:none;}
.ox-band__b{position:relative;z-index:2;max-width:60%;}
.ox-band__h{font-size:30px;font-weight:800;line-height:40px;color:var(--ox-ink-on-dark);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.ox-band__sub{font-size:16px;line-height:1.6;color:var(--ox-ink-2-on-dark);margin:18px 0 0;}
.ox-band__badges{display:flex;align-items:center;gap:40px;margin-top:38px;flex-wrap:wrap;}
.ox-bg{display:flex;align-items:center;gap:16px;}
.ox-bg__c{width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;color:var(--ox-ink-on-dark);flex:none;}
.ox-bg__t{font-size:13px;font-weight:600;color:var(--ox-ink-on-dark);display:block;}
.ox-bg__l{font-size:12px;font-weight:600;letter-spacing:.06em;color:var(--ox-ink-2-on-dark);display:block;}
.ox-lock{position:absolute;z-index:2;inset-block-end:40px;inset-inline-end:45px;}
.ox-lock__w{font-size:20px;font-weight:800;letter-spacing:.04em;color:#fff;display:block;}
.ox-lock__w b{color:var(--ox-accent);font-weight:800;}
.ox-lock__s{font-size:11px;font-weight:600;letter-spacing:.16em;color:var(--ox-ink-3-on-dark);display:block;margin-top:11px;}
.ox-tabs{position:relative;display:flex;align-items:center;gap:52px;margin-top:34px;border-bottom:1px solid var(--ox-line-2);padding-bottom:12px;overflow-x:auto;}
.ox-tab{font-size:16px;font-weight:500;color:var(--ox-ink-4);text-decoration:none;white-space:nowrap;}
.ox-tab.is-on{font-weight:700;color:var(--ox-ink);}
.ox-tabs__i{position:absolute;left:0;bottom:-1px;width:1px;height:3px;background:var(--ox-accent);transform-origin:0 0;transform:scaleX(0);transition:transform var(--ox-dur) var(--ox-ease);}
.ox-panels{display:grid;grid-template-columns:3fr 3fr 4fr;gap:20px;align-items:stretch;margin-top:30px;}
.ox-panel{background:var(--ox-card);border:1px solid #F0ECE5;border-radius:var(--ox-r);padding:24px;scroll-margin-top:120px;}
.ox-panel__h{display:flex;align-items:center;justify-content:space-between;font-size:18px;font-weight:700;color:var(--ox-ink);margin:0 0 20px;}
.ox-kv{display:block;border-top:1px solid #F1EDE6;}
.ox-kv__r{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:36px;padding:8px 0;border-bottom:1px solid #F1EDE6;}
.ox-kv__k{font-size:15px;font-weight:500;color:var(--ox-ink-4);flex:none;}
.ox-kv__v{font-size:15px;font-weight:600;color:var(--ox-ink);text-align:end;}
.ox-step{display:flex;align-items:flex-start;gap:20px;padding:16px 0;border-bottom:1px solid #F1EDE6;}
.ox-step:last-child{border-bottom:0;}
.ox-step__n{font-size:16px;font-weight:800;color:var(--ox-accent);display:block;}
.ox-step__b{font-size:15px;font-weight:700;line-height:22px;color:var(--ox-ink);display:block;}
.ox-step__g{font-size:15px;line-height:22px;color:var(--ox-ink-4);display:block;}
.ox-nut{border:1px solid #F0ECE5;border-radius:12px;overflow:hidden;}
.ox-nut__c{display:flex;justify-content:flex-end;height:30px;align-items:center;padding:0 12px;font-size:12px;font-weight:500;color:var(--ox-ink-4);}
.ox-nut__r{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:34px;padding:0 12px;border-top:1px solid #F1EDE6;}
.ox-nut__k{font-size:15px;font-weight:500;color:var(--ox-ink-4);}
.ox-nut__v{font-size:15px;font-weight:600;color:var(--ox-ink);}
.ox-more{display:inline-flex;align-items:center;gap:14px;margin-top:20px;background:none;border:0;padding:0;cursor:pointer;font-size:15px;font-weight:700;color:var(--ox-accent);}
.ox-more__p{width:32px;height:32px;border-radius:999px;background:var(--ox-accent);color:#fff;display:flex;align-items:center;justify-content:center;flex:none;}
.ox-note{font-size:13px;line-height:20px;color:var(--ox-ink-4);margin-top:16px;}
.ox-supply{margin-top:20px;padding-top:20px;border-top:1px solid #F1EDE6;}
.ox-supply__t{font-size:15px;font-weight:700;color:var(--ox-ink);margin:0 0 12px;}
.ox-supply__row{display:flex;align-items:center;gap:12px;}
.ox-supply__b{width:36px;height:36px;border-radius:8px;border:1px solid var(--ox-line);background:#fff;color:var(--ox-ink);cursor:pointer;display:flex;align-items:center;justify-content:center;}
.ox-supply__v{font-size:16px;font-weight:700;min-width:24px;text-align:center;}
.ox-supply__u{font-size:13px;color:var(--ox-ink-4);}
.ox-supply__r{margin-inline-start:auto;font-size:15px;font-weight:700;color:var(--ox-verify);}
.ox-reg__s{margin-bottom:24px;}
.ox-reg__l{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ox-ink-3-on-dark);margin-bottom:6px;}
.ox-reg__l .ox-i{color:#1F6B4F;}
.ox-barprice{display:none;}
@media(max-width:1023px){
.ox-panels{grid-template-columns:1fr;}
.ox-band{padding:24px;min-height:0;}
.ox-band__b{max-width:100%;}
.ox-lock{position:static;margin-top:24px;}
.ox-util{gap:20px;flex-wrap:wrap;}
.ox-gal{display:block;}
.ox-rail{flex-direction:row;width:auto;margin-top:12px;overflow-x:auto;}
.ox-rail__list{flex-direction:row;max-height:none;}
.ox-band__w,.ox-band__w2{display:none;}
.ox-trust{flex-wrap:wrap;gap:12px;}
body.ox-bar-on .ox-barprice{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:800;color:var(--ox-ink);padding-bottom:8px;}
}
@media(max-width:639px){
.ox-stats{grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:1fr 1fr;height:auto;gap:16px 0;}
.ox-stat+.ox-stat{border-inline-start:0;}
.ox-tabs{gap:24px;}
.ox-band__h{font-size:24px;line-height:32px;}
}
@media(prefers-reduced-motion:reduce){
.ox-tabs__i{transition:none;}
}
`;

  function injectBase() {
    if (D.getElementById('ox-base')) return;
    var head = D.head || D.getElementsByTagName('head')[0];
    if (!head) return;
    var style = E('style');
    style.id = 'ox-base';
    style.textContent = BASE;
    head.insertBefore(style, head.firstChild);
  }

  /* ------------------------------------------------------------------ *
   * 10. The header, on every page.
   * ------------------------------------------------------------------ */

  /* C.2 #2. One insertBefore: the search pill belongs to the main nav row. */
  function moveSearch() {
    var search = q('.top-navbar .header-search');
    if (!search) return;
    var row = q('#mainnav .container > div');
    var icons = q('#mainnav .container div.justify-end');
    if (!row || !icons || icons.parentNode !== row) return;
    row.insertBefore(search, icons);
    done(search, 'search');
  }

  /* C.2 #1. Raed ships neither the trust items nor the country control. */
  function utilityBar() {
    var bar = q('.top-navbar .container');
    if (!bar || built('util')) return;
    var items = [
      { t: T.authentic, i: 'shield' },
      { t: T.payment, i: 'lock' },
      { t: T.shipping, i: 'truck' }
    ];
    var row = done(E('div', 'ox-util'), 'util');
    for (var i = 0; i < items.length; i += 1) {
      var it = A(row, E('div', 'ox-util__it'));
      var g = icon(items[i].i, 16);
      if (g) A(it, g);
      A(it, E('span', '', items[i].t));
    }
    bar.appendChild(row);

    var code = cfg('store.store_country') || cfg('store.country');
    var name = code ? COUNTRIES[String(code).toUpperCase()] : null;
    if (!name) return;
    var chooser = can('city');
    var ctrl = done(E(chooser ? 'button' : 'div', 'ox-country'), 'country');
    if (chooser) {
      ctrl.type = 'button';
      var chev = icon('chev', 10, 'ox-chev');
      if (chev) A(ctrl, chev);
    }
    A(ctrl, E('span', '', name));
    bar.appendChild(ctrl);
  }

  /* C.2 #3. The wishlist button the design shows beside account and cart. */
  function wishButton() {
    var icons = q('#mainnav .container div.justify-end');
    if (!icons || built('wish')) return;
    var a = done(E('a', 'ox-wish'), 'wish');
    a.href = '/wishlist';
    a.setAttribute('aria-label', T.wishlist);
    var g = icon('heart', 22);
    if (g) A(a, g);
    var n = wishCount();
    if (n > 0) A(a, E('span', 'ox-count', String(n)));
    icons.insertBefore(a, icons.firstChild);
  }

  function wishCount() {
    try {
      var items = W.salla && W.salla.storage ? W.salla.storage.get('wishlist') : null;
      if (items && items.length) return items.length;
    } catch (e) {
      /* no runtime, no count, no pill */
    }
    return 0;
  }

  /* ------------------------------------------------------------------ *
   * 11. The gallery: the thumbnail rail, the badge and the zoom affordance.
   * ------------------------------------------------------------------ */

  function slider() {
    return q('salla-slider.details-slider');
  }

  function sliderImages() {
    var s = slider();
    if (!s) return [];
    try {
      var raw = s.getAttribute('data-images');
      var list = raw ? JSON.parse(raw) : [];
      var out = [];
      for (var i = 0; i < list.length; i += 1) {
        if (list[i] && list[i].url && list[i].type !== 'video') out.push(list[i]);
      }
      return out;
    } catch (e) {
      return [];
    }
  }

  /* C.2 #4. One image means no rail at all and the plate takes the column. */
  function thumbRail() {
    var s = slider();
    if (!s || built('rail')) return;
    var images = sliderImages();
    if (images.length < 2) return;
    var column = s.parentNode;
    if (!column) return;
    column.classList.add('ox-gal');

    var rail = done(E('div', 'ox-rail'), 'rail');
    var up = A(rail, E('button', 'ox-rail__b'));
    up.type = 'button';
    up.setAttribute('aria-label', T.prev);
    var upIcon = icon('chev', 16);
    if (upIcon) {
      upIcon.style.transform = 'rotate(180deg)';
      A(up, upIcon);
    }

    var list = A(rail, E('div', 'ox-rail__list'));
    var thumbs = [];
    for (var i = 0; i < images.length; i += 1) {
      var b = A(list, E('button', 'ox-thumb' + (i === 0 ? ' is-on' : '')));
      b.type = 'button';
      b.setAttribute('aria-label', fill(fill(T.gallery_image, 'index', i + 1), 'total', images.length));
      var img = A(b, E('img'));
      img.src = images[i].url;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      thumbs.push(b);
      (function (index, button) {
        button.addEventListener('click', function () {
          goSlide(index);
          for (var k = 0; k < thumbs.length; k += 1) thumbs[k].classList.toggle('is-on', k === index);
        });
      })(i, b);
    }

    var down = A(rail, E('button', 'ox-rail__b'));
    down.type = 'button';
    down.setAttribute('aria-label', T.next);
    var downIcon = icon('chev', 16);
    if (downIcon) A(down, downIcon);

    function page(step) {
      try {
        list.scrollTop += step * 84;
      } catch (e) {
        /* nothing to scroll */
      }
    }
    up.addEventListener('click', function () {
      page(-1);
    });
    down.addEventListener('click', function () {
      page(1);
    });

    column.insertBefore(rail, s);
  }

  function goSlide(index) {
    var s = slider();
    if (!s) return;
    try {
      if (s.swiper && s.swiper.slideTo) {
        s.swiper.slideTo(index);
        return;
      }
      if (s.slideTo) s.slideTo(index);
    } catch (e) {
      /* the slider has not hydrated; the thumbnail still marks itself */
    }
  }

  /* C.2 #5 and #6. Both live on the plate, both gated on real behaviour. */
  function plateMarks() {
    var s = slider();
    if (!s) return;
    if (can('bestseller') && !built('badge')) {
      s.appendChild(done(E('span', 'ox-badge-top', T.bestseller), 'badge'));
    }
    if (built('zoom')) return;
    var magnify = q('a.magnify-wrapper', s);
    if (!magnify) return;
    var b = done(E('button', 'ox-zoom'), 'zoom');
    b.type = 'button';
    A(b, E('span', '', T.zoom));
    var g = icon('zoom', 16);
    if (g) A(b, g);
    b.addEventListener('click', function () {
      var target = q('a.magnify-wrapper', slider());
      if (target) target.click();
    });
    s.appendChild(b);
    try {
      new MutationObserver(function () {
        if (!q('[' + MK + '="zoom"]', s)) guard('plate', plateMarks);
      }).observe(s, { childList: true });
    } catch (e) {
      /* no observer: the load pass is the second and last chance */
    }
  }

  /* ------------------------------------------------------------------ *
   * 12. The buy column.
   * ------------------------------------------------------------------ */

  function title() {
    return q('.main-content h1[data-testid="store-product-title"]') || q('.main-content h1');
  }

  function subtitle() {
    return q('.main-content h2.product-entry__sub-title');
  }

  /* C.2 #7. The brand line, only when the catalogue records a brand. */
  function brandLine() {
    if (built('brandline') || !can('brand')) return;
    var h1 = title();
    if (!h1 || !h1.parentNode) return;
    var name = brandName();
    var a = done(E('a', 'ox-brandline'), 'brandline');
    a.href = '/brands';
    a.appendChild(bdi(name));
    h1.parentNode.insertBefore(a, h1);
  }

  /* C.2 #8. Five stars, the value and the count, or nothing at all. */
  function ratingRow() {
    if (built('rating') || !can('rating')) return;
    var anchor = subtitle() || title();
    if (!anchor || !anchor.parentNode) return;
    var count = ratingCount();
    var value = ratingValue();
    if (value == null) return;
    var row = done(E('div', 'ox-rating'), 'rating');
    var stars = A(row, E('div', 'ox-rating__s'));
    for (var i = 1; i <= 5; i += 1) {
      var g = icon('star', 14, 'ox-star' + (i <= Math.round(value) ? ' is-on' : ''));
      if (g) A(stars, g);
    }
    A(row, E('span', 'ox-rating__v', String(value)));
    A(row, E('span', 'ox-rating__c', fill(T.rating_count, 'count', count)));
    anchor.parentNode.insertBefore(row, anchor.nextSibling);
  }

  /*
   * C.2 #9. The four statistic cards, right to left as the design reads them:
   * pack size, the diet or dosage mark, calories, protein. A cell with no
   * source is not built; the survivors stay equal width with rules between.
   */
  function statCards() {
    if (built('stats')) return;
    var host = q('.main-content .product__description');
    if (!host || !host.parentNode) return;

    var cells = [];
    var size = packSize();
    if (size) cells.push({ v: size, l: [T.size], latin: true });

    if (hasFact('vegan')) cells.push({ g: 'leaf', l: ['نباتي', 'Vegan'], latin2: true });
    else {
      var s = spec();
      if (s && s.form) cells.push({ v: s.form, l: [T.form] });
    }

    var kcal = nutrientOf(['السعرات']);
    if (kcal) cells.push({ v: kcal.v, l: [kcal.k, T.per_serving] });

    var protein = nutrientOf(['البروتين']);
    if (protein) cells.push({ v: protein.v, l: [protein.k, T.per_serving] });

    if (!cells.length) return;

    var row = done(E('div', 'ox-stats'), 'stats');
    for (var i = 0; i < cells.length; i += 1) {
      var c = cells[i];
      var cell = A(row, E('div', 'ox-stat'));
      if (c.g) {
        var g = icon(c.g, 24);
        if (g) {
          g.style.color = 'var(--ox-verify)';
          A(cell, g);
        }
      } else {
        var v = A(cell, E('span', 'ox-stat__v'));
        if (c.latin) v.appendChild(bdi(c.v));
        else v.textContent = c.v;
      }
      var label = A(cell, E('span', 'ox-stat__l'));
      for (var j = 0; j < c.l.length; j += 1) {
        var line = A(label, E('span', ''));
        if (c.latin2 && j === 1) line.appendChild(bdi(c.l[j]));
        else line.textContent = c.l[j];
      }
    }
    host.parentNode.insertBefore(row, host.nextSibling);
  }

  function buyForm() {
    return q('.main-content form.product-form');
  }

  /* C.2 #10. Marks only, from the gateways the store has enabled. Salla's own
   * component draws them, so no payment method is ever written as text. */
  function paymentMarks() {
    if (built('pay') || !can('pay')) return;
    var form = buyForm();
    if (!form || !form.parentNode) return;
    var row = done(E('div', 'ox-pay'), 'pay');
    row.appendChild(D.createElement('salla-payments'));
    form.parentNode.insertBefore(row, form.nextSibling);
    W.setTimeout(function () {
      try {
        var el = q('salla-payments', row);
        var drawn = el && (el.children.length > 0 || (el.shadowRoot && el.shadowRoot.childElementCount > 0));
        if (!drawn && row.parentNode) row.parentNode.removeChild(row);
      } catch (e) {
        /* leave it alone rather than remove something that did render */
      }
    }, 2500);
  }

  /** The configured estimate window, as the dashboard wrote it, or null. */
  function deliveryText() {
    var raw =
      cfg('store.shipping.estimated_delivery') ||
      cfg('store.shipping.delivery_time') ||
      cfg('store.settings.shipping.estimate');
    if (!raw) return null;
    if (typeof raw === 'string') return raw.trim() || null;
    if (raw && typeof raw === 'object' && raw.text) return String(raw.text).trim() || null;
    return null;
  }

  function deliveryCity() {
    var c = cfg('user.city') || cfg('store.shipping.delivery_location');
    if (!c) return null;
    if (typeof c === 'string') return c.trim() || null;
    if (c && typeof c === 'object') return c.name ? String(c.name) : null;
    return null;
  }

  /* C.2 #11. The pill, then the pickup fallback, then nothing. */
  function deliveryRow() {
    if (built('deliver')) return;
    var form = buyForm();
    if (!form || !form.parentNode) return;

    var line = null;
    if (can('delivery')) {
      var city = deliveryCity();
      line = T.delivery_estimate + ': ' + deliveryText() + (city ? ' إلى ' + city : '');
    } else if (can('pickup')) {
      line = T.pickup_free;
    }
    if (!line) return;

    var chooser = can('city');
    var pill = done(E(chooser ? 'button' : 'div', 'ox-deliver'), 'deliver');
    if (chooser) pill.type = 'button';
    var chev = icon('chev', 16);
    if (chev) {
      chev.style.transform = 'rotate(90deg)';
      A(pill, chev);
    }
    var truck = icon('truck', 20);
    if (truck) A(pill, truck);
    A(pill, E('span', '', line));
    if (chooser) A(pill, E('span', 'ox-deliver__c', T.change_city));

    var after = q('[' + MK + '="pay"]') || form;
    after.parentNode.insertBefore(pill, after.nextSibling);
  }

  /* C.2 #12. Three items. Each sub-line has its own gate; a gated-off
   * sub-line leaves the title alone in the same 45px. */
  function trustRow() {
    if (built('trust')) return;
    var form = buyForm();
    if (!form || !form.parentNode) return;
    var items = [
      { i: 'lock', t: T.payment, s: can('pay') ? T.payment_marks : null },
      { i: 'truck', t: T.shipping, s: can('tracking') ? T.shipping_line : null },
      { i: 'shield', t: T.authentic, s: can('expiry') ? T.authentic_line : null }
    ];
    var row = done(E('div', 'ox-trust'), 'trust');
    for (var i = 0; i < items.length; i += 1) {
      var it = A(row, E('div', 'ox-trust__it'));
      var g = icon(items[i].i, 22);
      if (g) A(it, g);
      var box = A(it, E('div', ''));
      A(box, E('span', 'ox-trust__t', items[i].t));
      if (items[i].s) A(box, E('span', 'ox-trust__s', items[i].s));
    }
    var after = q('[' + MK + '="deliver"]') || q('[' + MK + '="pay"]') || form;
    after.parentNode.insertBefore(row, after.nextSibling);
  }

  /* ------------------------------------------------------------------ *
   * 13. Everything below the two columns: the band, the strip, the panels.
   * ------------------------------------------------------------------ */

  function afterHost() {
    var host = q('[' + MK + '="after"]');
    if (host) return host;
    var details = q('.container--product-details');
    if (!details || !details.parentNode) return null;
    host = done(E('div', 'container ox-after'), 'after');
    details.parentNode.insertBefore(host, details.nextSibling);
    return host;
  }

  /* C.2 #13. The band's words are the product's own; its badges are the
   * facts the merchant stated in the description and nothing else. */
  function brandBand() {
    if (built('band')) return;
    var host = afterHost();
    if (!host) return;
    var head = txt(subtitle()) || txt(title());
    if (!head) return;

    var band = done(E('section', 'ox-band'), 'band');
    var img = A(band, E('img', 'ox-band__img'));
    img.src = BAND_PHOTO;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    A(band, E('span', 'ox-band__v1'));
    A(band, E('span', 'ox-band__v2'));
    A(band, E('span', 'ox-band__w'));
    A(band, E('span', 'ox-band__w2'));

    var body = A(band, E('div', 'ox-band__b'));
    A(body, E('h2', 'ox-band__h', head));

    var s = spec();
    if (s) {
      var facts = [];
      if (s.servingsText) facts.push(T.servings + ': ' + s.servingsText);
      if (s.servingSize) facts.push(T.serving_size + ': ' + s.servingSize);
      if (s.form) facts.push(T.form + ': ' + s.form);
      if (facts.length) A(body, E('p', 'ox-band__sub', facts.join(' · ')));
    }

    var stated = statedFacts();
    if (stated.length) {
      var badges = A(body, E('div', 'ox-band__badges'));
      for (var i = 0; i < stated.length; i += 1) {
        var f = stated[i];
        var badge = A(badges, E('div', 'ox-bg'));
        var circle = A(badge, E('span', 'ox-bg__c'));
        var g = icon(f.ic, 16);
        if (g) A(circle, g);
        var text = A(badge, E('span', ''));
        A(text, E('span', 'ox-bg__t', f.ar));
        var latin = A(text, E('span', 'ox-bg__l'));
        latin.appendChild(bdi(f.la));
      }
    }

    var lock = A(band, E('div', 'ox-lock'));
    var word = A(lock, E('span', 'ox-lock__w'));
    word.appendChild(bdi('OPTIMAL'));
    var x = A(word, E('b', ''));
    x.appendChild(bdi('X'));
    var sub = A(lock, E('span', 'ox-lock__s'));
    sub.appendChild(bdi('PERFORMANCE NUTRITION'));

    host.appendChild(band);
  }

  /* ---- the three panels ------------------------------------------- */

  function panel(id, heading) {
    var p = E('section', 'ox-panel');
    p.id = id;
    var h = A(p, E('h2', 'ox-panel__h'));
    A(h, E('span', '', heading));
    return p;
  }

  function kvRow(list, key, value, latin) {
    var r = A(list, E('div', 'ox-kv__r'));
    A(r, E('span', 'ox-kv__k', key));
    var v = A(r, E('span', 'ox-kv__v'));
    if (latin) v.appendChild(ltr(value));
    else v.textContent = value;
  }

  /* The details table: the spec line's own fields, the printed size, the
   * brand and the merchant's product number. A field with no value has no
   * row; nothing is defaulted. */
  function detailsPanel() {
    var rows = [];
    var brand = brandName();
    if (brand) rows.push({ k: T.brand, v: brand, ltr: true });
    var size = packSize();
    if (size) rows.push({ k: T.size, v: size, ltr: true });
    var s = spec();
    if (s) {
      if (s.servingsText) rows.push({ k: T.servings, v: s.servingsText });
      if (s.servingSize) rows.push({ k: T.serving_size, v: s.servingSize });
      if (s.form) rows.push({ k: T.form, v: s.form });
      if (s.expiryText) rows.push({ k: T.expiry, v: s.expiryText, ltr: !!s.expiry });
    }
    var sku = txt(q('.product-sku'));
    if (sku) rows.push({ k: T.sku, v: sku, ltr: true });
    if (!rows.length) return null;

    var p = panel('ox-p-details', T.facts);
    var list = A(p, E('div', 'ox-kv'));
    for (var i = 0; i < rows.length; i += 1) kvRow(list, rows[i].k, rows[i].v, rows[i].ltr);
    var calc = supplyCalculator();
    if (calc) A(p, calc);
    return p;
  }

  /* The method panel: one step per sentence the merchant wrote, one glyph
   * each at the inline start. Fewer than one sentence means no panel. */
  var STEP_ICONS = ['cup', 'shaker', 'straw'];

  function methodPanel() {
    var list = steps();
    if (!list.length) return null;
    var p = panel('ox-p-method', T.how_to_use);
    for (var i = 0; i < list.length; i += 1) {
      var step = A(p, E('div', 'ox-step'));
      var g = icon(STEP_ICONS[i % STEP_ICONS.length], 48);
      if (g) {
        g.setAttribute('stroke-width', '1.4');
        A(step, g);
      }
      var box = A(step, E('div', ''));
      var n = A(box, E('span', 'ox-step__n'));
      n.appendChild(bdi(i < 9 ? '0' + (i + 1) : String(i + 1)));
      var text = list[i];
      var at = text.indexOf('،');
      if (at > 0) {
        A(box, E('span', 'ox-step__b', text.slice(0, at).trim()));
        A(box, E('span', 'ox-step__g', text.slice(at + 1).trim()));
      } else {
        A(box, E('span', 'ox-step__b', text));
      }
    }
    return p;
  }

  /* The nutrition panel: the label's own table, six rows, then the
   * disclosure when the label carries more. */
  var SHOWN = 6;

  function nutritionPanel() {
    var n = nutrition();
    if (!n) return null;
    var p = panel('ox-p-nutrition', T.nutrition_title);
    var card = A(p, E('div', 'ox-nut'));

    var s = spec();
    var caption = n.head && n.head.v ? n.head.v : null;
    if (caption && s && s.servingSize) caption += ' (' + s.servingSize + ')';
    if (caption) A(card, E('div', 'ox-nut__c', caption));

    var extra = [];
    for (var i = 0; i < n.rows.length; i += 1) {
      var r = A(card, E('div', 'ox-nut__r'));
      A(r, E('span', 'ox-nut__k', n.rows[i].k));
      var v = A(r, E('span', 'ox-nut__v'));
      v.appendChild(bdi(n.rows[i].v));
      if (i >= SHOWN) {
        r.style.display = 'none';
        extra.push(r);
      }
    }

    if (extra.length) {
      var more = A(p, E('button', 'ox-more'));
      more.type = 'button';
      more.setAttribute('aria-expanded', 'false');
      var plus = A(more, E('span', 'ox-more__p'));
      var g = icon('plus', 14);
      if (g) A(plus, g);
      A(more, E('span', '', T.show_all));
      more.addEventListener('click', function () {
        var open = more.getAttribute('aria-expanded') === 'true';
        for (var k = 0; k < extra.length; k += 1) extra[k].style.display = open ? 'none' : '';
        more.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
      A(p, E('p', 'ox-note', T.label_note));
    }
    return p;
  }

  /* The supply calculator, kept from v2: it describes the package, never a
   * person, and does not exist when the label printed no servings count. */
  function supplyCalculator() {
    var s = spec();
    if (!s || !s.servings) return null;
    var box = E('div', 'ox-supply');
    A(box, E('p', 'ox-supply__t', T.supply_title));
    var row = A(box, E('div', 'ox-supply__row'));
    var minus = A(row, E('button', 'ox-supply__b'));
    minus.type = 'button';
    minus.setAttribute('aria-label', T.supply_less);
    minus.textContent = '−';
    var value = A(row, E('span', 'ox-supply__v'));
    var plus = A(row, E('button', 'ox-supply__b'));
    plus.type = 'button';
    plus.setAttribute('aria-label', T.supply_more);
    plus.textContent = '+';
    A(row, E('span', 'ox-supply__u', T.supply_per_day));
    var out = A(row, E('span', 'ox-supply__r'));
    var dose = 1;
    function draw() {
      value.textContent = String(dose);
      var days = supplyDays(s.servings, dose);
      out.textContent = days == null ? '' : fill(T.supply_days, 'days', days);
    }
    minus.addEventListener('click', function () {
      dose = clampDose(dose - 1);
      draw();
    });
    plus.addEventListener('click', function () {
      dose = clampDose(dose + 1);
      draw();
    });
    draw();
    A(box, E('p', 'ox-note', T.supply_note));
    return box;
  }

  /*
   * C.2 #14 and #15. The strip is an anchor strip, not a tab control: the
   * design shows five labels and three open panels at once. A label exists
   * only when its region does, and the indicator follows whichever region is
   * in view.
   */
  function panelsAndStrip() {
    if (built('panels')) return;
    var host = afterHost();
    if (!host) return;

    var panels = [];
    var details = detailsPanel();
    if (details) panels.push({ el: details, t: T.facts });
    var method = methodPanel();
    if (method) panels.push({ el: method, t: T.how_to_use });
    var nutri = nutritionPanel();
    if (nutri) panels.push({ el: nutri, t: T.nutrition_title });
    if (!panels.length) return;

    var targets = [];
    var strip = done(E('nav', 'ox-tabs'), 'panels');
    var labels = [];
    for (var i = 0; i < panels.length; i += 1) {
      var a = A(strip, E('a', 'ox-tab' + (i === 0 ? ' is-on' : ''), panels[i].t));
      a.href = '#' + panels[i].el.id;
      labels.push(a);
      targets.push(panels[i].el);
    }

    var comments = q('salla-comments');
    if (comments && can('reviews')) {
      if (!comments.id) comments.id = 'ox-reviews';
      var r = A(strip, E('a', 'ox-tab', T.reviews));
      r.href = '#' + comments.id;
      labels.push(r);
      targets.push(comments);
    }

    var indicator = A(strip, E('span', 'ox-tabs__i'));
    host.appendChild(strip);

    var grid = E('div', 'ox-panels');
    for (var j = 0; j < panels.length; j += 1) A(grid, panels[j].el);
    if (panels.length === 2) grid.style.gridTemplateColumns = '3fr 4fr';
    if (panels.length === 1) grid.style.gridTemplateColumns = '1fr';
    host.appendChild(grid);

    scrollspy(labels, targets, indicator);
  }

  function scrollspy(labels, targets, indicator) {
    var active = -1;

    function move(index) {
      if (index < 0 || index >= labels.length) return;
      active = index;
      for (var i = 0; i < labels.length; i += 1) labels[i].classList.toggle('is-on', i === index);
      var el = labels[index];
      indicator.style.transform = 'translateX(' + el.offsetLeft + 'px) scaleX(' + el.offsetWidth + ')';
    }

    move(0);

    try {
      var io = new IntersectionObserver(
        function (entries) {
          var best = -1;
          var bestRatio = 0;
          for (var i = 0; i < entries.length; i += 1) {
            if (!entries[i].isIntersecting) continue;
            var at = targets.indexOf(entries[i].target);
            if (at < 0) continue;
            if (entries[i].intersectionRatio >= bestRatio) {
              bestRatio = entries[i].intersectionRatio;
              best = at;
            }
          }
          if (best >= 0 && best !== active) move(best);
        },
        { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.2, 0.5, 1] }
      );
      for (var k = 0; k < targets.length; k += 1) io.observe(targets[k]);
    } catch (e) {
      /* no observer, no scrollspy; the first label stays marked */
    }

    W.addEventListener('resize', function () {
      move(active < 0 ? 0 : active);
    });
  }

  /* ------------------------------------------------------------------ *
   * 14. The mobile bottom bar: a live price mirror and the reveal.
   *     C.2 #19. The mirror follows the real price node so a variant change
   *     is never left stale.
   * ------------------------------------------------------------------ */

  function bottomBar() {
    if (built('bar')) return;
    var bar = q('.main-content section.sticky-product-bar');
    if (!bar) return;
    var price = q('.main-content form.product-form .price-wrapper') || q('.main-content h2.total-price');
    if (!price) return;

    var mirror = done(E('div', 'ox-barprice'), 'bar');
    function sync() {
      mirror.textContent = '';
      mirror.appendChild(price.cloneNode(true));
    }
    sync();
    bar.insertBefore(mirror, bar.firstChild);
    try {
      new MutationObserver(sync).observe(price, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    } catch (e) {
      /* a static mirror is still correct for a product with no variants */
    }

    var watch = price.closest ? price.closest('section') : null;
    if (!watch) watch = price;
    try {
      var io = new IntersectionObserver(
        function (entries) {
          D.body.classList.toggle('ox-bar-on', !entries[0].isIntersecting);
        },
        { threshold: 0 }
      );
      io.observe(watch);
    } catch (e) {
      /* without an observer the bar simply stays as the stylesheet left it */
    }
  }

  /* ------------------------------------------------------------------ *
   * 15. The footer's registration block. C.2 #18. Each number is printed
   *     only when the dashboard carries it; the VAT number is not set today,
   *     so that line does not ship and the block renders the register alone.
   * ------------------------------------------------------------------ */

  function registration() {
    if (built('reg')) return;
    var grid = q('footer.store-footer .store-footer__inner .container');
    if (!grid) return;
    var cr = can('cr') ? String(cfg('store.settings.commercial_number')) : null;
    var vat = can('vat') ? String(cfg('store.settings.tax.number')) : null;
    if (!cr && !vat) return;

    var block = done(E('div', 'ox-reg'), 'reg');
    var social = q('.store-footer__inner salla-social');
    if (social) {
      var wrap = A(block, E('div', 'ox-reg__s'));
      wrap.appendChild(social);
    }
    if (cr) A(block, regLine(T.cr, cr));
    if (vat) A(block, regLine(T.vat, vat));
    grid.insertBefore(block, grid.firstChild);
  }

  function regLine(label, value) {
    var line = E('div', 'ox-reg__l');
    var g = icon('shield', 16);
    if (g) A(line, g);
    A(line, E('span', '', label));
    line.appendChild(ltr(value));
    return line;
  }

  /* ------------------------------------------------------------------ *
   * 16. Run. One guard per feature: one throwing cannot stop another and
   *     cannot leave the page worse than it started.
   * ------------------------------------------------------------------ */

  function guard(name, fn) {
    try {
      fn();
    } catch (e) {
      if (W.console && W.console.warn) W.console.warn('optimalx: ' + name, e);
    }
  }

  function run() {
    guard('base', injectBase);
    guard('search', moveSearch);
    guard('utility', utilityBar);
    guard('wishlist', wishButton);
    guard('registration', registration);
    if (!isProduct()) return;
    guard('rail', thumbRail);
    guard('plate', plateMarks);
    guard('brand', brandLine);
    guard('rating', ratingRow);
    guard('stats', statCards);
    guard('payments', paymentMarks);
    guard('delivery', deliveryRow);
    guard('trust', trustRow);
    guard('band', brandBand);
    guard('panels', panelsAndStrip);
    guard('bar', bottomBar);
  }

  /*
   * Three passes, all idempotent: now, at DOMContentLoaded for anything the
   * parser had not reached, and at load for the components that hydrate late
   * (the slider's swiper, the header buttons, salla-payments).
   */
  run();
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', run, { once: true });
  W.addEventListener('load', run, { once: true });
})();
