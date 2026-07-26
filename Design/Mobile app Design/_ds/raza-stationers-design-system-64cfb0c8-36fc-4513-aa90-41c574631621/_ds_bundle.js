/* @ds-bundle: {"format":4,"namespace":"RazaStationersDesignSystem_64cfb0","components":[{"name":"AdminSidebar","sourcePath":"components/admin/AdminSidebar.jsx"},{"name":"DataTable","sourcePath":"components/admin/DataTable.jsx"},{"name":"LowStockPanel","sourcePath":"components/admin/LowStockPanel.jsx"},{"name":"MetricCard","sourcePath":"components/admin/MetricCard.jsx"},{"name":"SimpleBarChart","sourcePath":"components/admin/SimpleBarChart.jsx"},{"name":"SimpleLineChart","sourcePath":"components/admin/SimpleLineChart.jsx"},{"name":"TopBar","sourcePath":"components/admin/TopBar.jsx"},{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Panel","sourcePath":"components/core/Panel.jsx"},{"name":"StatusBadge","sourcePath":"components/feedback/StatusBadge.jsx"},{"name":"CheckboxOption","sourcePath":"components/forms/CheckboxOption.jsx"},{"name":"PhoneInput","sourcePath":"components/forms/PhoneInput.jsx"},{"name":"QuantityStepper","sourcePath":"components/forms/QuantityStepper.jsx"},{"name":"RadioOption","sourcePath":"components/forms/RadioOption.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextInput","sourcePath":"components/forms/TextInput.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"NotificationDropdown","sourcePath":"components/navigation/NotificationDropdown.jsx"},{"name":"PillNavbar","sourcePath":"components/navigation/PillNavbar.jsx"}],"sourceHashes":{"components/admin/AdminSidebar.jsx":"ebcd05dc95c3","components/admin/DataTable.jsx":"03c350982b99","components/admin/LowStockPanel.jsx":"13c43506174a","components/admin/MetricCard.jsx":"909d6e6916da","components/admin/SimpleBarChart.jsx":"1b045c23f425","components/admin/SimpleLineChart.jsx":"72930e03822f","components/admin/TopBar.jsx":"0c9adef41aaf","components/commerce/ProductCard.jsx":"da63f580ece7","components/core/Avatar.jsx":"441443d53171","components/core/Button.jsx":"e4549fe190eb","components/core/Icon.jsx":"fe50d4c702c1","components/core/Panel.jsx":"3d9f426e4c16","components/feedback/StatusBadge.jsx":"bb97690fb747","components/forms/CheckboxOption.jsx":"555890704112","components/forms/PhoneInput.jsx":"82a28aac788c","components/forms/QuantityStepper.jsx":"ffd84e5d5cf4","components/forms/RadioOption.jsx":"a4a9c178b0a3","components/forms/Select.jsx":"f0f189c1e760","components/forms/TextInput.jsx":"4e36b1f26ba2","components/navigation/BottomNav.jsx":"0d9680b07a3d","components/navigation/NotificationDropdown.jsx":"5d8f298a07a0","components/navigation/PillNavbar.jsx":"7442bd747332","ui_kits/admin/Dashboard.jsx":"bfafae471088","ui_kits/admin/Inventory.jsx":"336ede400d89","ui_kits/admin/Orders.jsx":"713ca7324c85","ui_kits/storefront/Account.jsx":"a5e77bd8bdeb","ui_kits/storefront/Cart.jsx":"86cdd10b0bfe","ui_kits/storefront/Catalogue.jsx":"759c14ca6253","ui_kits/storefront/Home.jsx":"9ae588007638"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RazaStationersDesignSystem_64cfb0 = window.RazaStationersDesignSystem_64cfb0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/admin/AdminSidebar.jsx
try { (() => {
function AdminSidebar(props) {
  const items = props.items || [];
  return React.createElement('div', {
    style: {
      width: 200,
      background: 'var(--ink-900)',
      padding: '20px 14px',
      flexShrink: 0
    }
  }, [React.createElement('div', {
    key: 'brand',
    style: {
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontSize: 15,
      fontWeight: 600,
      marginBottom: 24,
      padding: '0 10px'
    }
  }, props.brand || 'Raza Admin'), ...items.map((it, i) => React.createElement('div', {
    key: i,
    style: {
      color: it.active ? '#fff' : 'var(--sage-400)',
      background: it.active ? 'var(--accent-primary)' : 'transparent',
      borderRadius: 10,
      padding: '10px 12px',
      fontSize: 13,
      fontWeight: it.active ? 600 : 400,
      marginBottom: 6,
      cursor: 'pointer'
    },
    onClick: () => props.onItemClick && props.onItemClick(i)
  }, it.label))]);
}
Object.assign(__ds_scope, { AdminSidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/AdminSidebar.jsx", error: String((e && e.message) || e) }); }

// components/admin/DataTable.jsx
try { (() => {
function DataTable(props) {
  const {
    columns,
    rows
  } = props;
  const cellStyle = {
    display: 'table-cell',
    padding: '10px 6px',
    borderTop: '1px solid var(--border-subtle)'
  };
  return React.createElement('div', {
    style: {
      display: 'table',
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, [React.createElement('div', {
    key: 'head',
    style: {
      display: 'table-row',
      textAlign: 'left',
      color: 'var(--sage-400)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }
  }, columns.map(c => React.createElement('div', {
    key: c,
    style: {
      display: 'table-cell',
      padding: '8px 6px',
      fontWeight: 600
    }
  }, c))), ...rows.map((row, i) => React.createElement('div', {
    key: i,
    style: {
      display: 'table-row'
    }
  }, row.map((cell, j) => React.createElement('div', {
    key: j,
    style: {
      ...cellStyle,
      fontWeight: j === row.length - 1 ? 600 : 400
    }
  }, cell))))]);
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/admin/LowStockPanel.jsx
try { (() => {
function LowStockPanel(props) {
  return React.createElement('div', null, (props.items || []).map((it, i) => React.createElement('div', {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-subtle)',
      fontSize: 13
    }
  }, [React.createElement('span', {
    key: 'n'
  }, it.name), React.createElement('span', {
    key: 'q',
    style: {
      fontWeight: 700,
      color: 'var(--amber-500)'
    }
  }, `${it.qty} left`)])));
}
Object.assign(__ds_scope, { LowStockPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/LowStockPanel.jsx", error: String((e && e.message) || e) }); }

// components/admin/MetricCard.jsx
try { (() => {
function MetricCard(props) {
  return React.createElement('div', {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 22
    }
  }, [React.createElement('div', {
    key: 'label',
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, [props.label, props.urduLabel ? React.createElement('span', {
    key: 'ur',
    dir: 'rtl',
    style: {
      fontFamily: 'var(--font-urdu)',
      marginLeft: 6
    }
  }, props.urduLabel) : null]), React.createElement('div', {
    key: 'value',
    style: {
      fontSize: 26,
      fontWeight: 700,
      marginTop: 8
    }
  }, props.value), React.createElement('div', {
    key: 'trend',
    style: {
      fontSize: 12,
      fontWeight: 600,
      marginTop: 6,
      color: props.trendDirection === 'down' ? 'var(--red-500)' : 'var(--evergreen-600)'
    }
  }, `${props.trendDirection === 'down' ? '\u25BC' : '\u25B2'} ${props.trend}`)]);
}
Object.assign(__ds_scope, { MetricCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/MetricCard.jsx", error: String((e && e.message) || e) }); }

// components/admin/SimpleBarChart.jsx
try { (() => {
function SimpleBarChart(props) {
  const bars = props.bars || [];
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 14,
      height: props.height || 120
    }
  }, bars.map((b, i) => React.createElement('div', {
    key: i,
    style: {
      width: 28,
      height: `${b.value}%`,
      background: b.emphasis ? 'var(--evergreen-600)' : 'var(--sage-400)',
      borderRadius: '6px 6px 0 0'
    }
  })));
}
Object.assign(__ds_scope, { SimpleBarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/SimpleBarChart.jsx", error: String((e && e.message) || e) }); }

// components/admin/SimpleLineChart.jsx
try { (() => {
function SimpleLineChart(props) {
  const points = props.points || '0,90 50,70 100,78 150,50 200,58 250,30 300,20';
  return React.createElement('svg', {
    width: '100%',
    height: props.height || 120,
    viewBox: '0 0 300 120',
    preserveAspectRatio: 'none'
  }, [React.createElement('polyline', {
    key: 'glow',
    points,
    fill: 'none',
    stroke: 'var(--sage-400)',
    strokeWidth: 8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    opacity: 0.15
  }), React.createElement('polyline', {
    key: 'line',
    points,
    fill: 'none',
    stroke: 'var(--evergreen-600)',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  })]);
}
Object.assign(__ds_scope, { SimpleLineChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/SimpleLineChart.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCard.jsx
try { (() => {
function ProductCard(props) {
  return React.createElement('div', {
    style: {
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      background: 'var(--surface-page)',
      maxWidth: 320
    }
  }, [React.createElement('div', {
    key: 'icon',
    style: {
      width: 56,
      height: 56,
      borderRadius: 14,
      background: 'var(--accent-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
      color: '#fff'
    }
  }, props.icon), React.createElement('div', {
    key: 'cat',
    style: {
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--forest-700)',
      background: 'var(--mist-100)',
      padding: '4px 12px',
      borderRadius: 'var(--radius-pill)',
      marginBottom: 10
    }
  }, props.category), React.createElement('div', {
    key: 'name',
    style: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 1.3
    }
  }, props.name), props.nameUrdu ? React.createElement('div', {
    key: 'nameUr',
    dir: 'rtl',
    style: {
      fontFamily: 'var(--font-urdu)',
      fontSize: 16,
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, props.nameUrdu) : null, React.createElement('div', {
    key: 'price',
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      marginTop: 14
    }
  }, [React.createElement('div', {
    key: 'p',
    style: {
      fontSize: 20,
      fontWeight: 700
    }
  }, props.price), React.createElement('div', {
    key: 'l',
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, 'Retail')]), props.wholesalePrice ? React.createElement('div', {
    key: 'wp',
    style: {
      marginTop: 8,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--forest-700)',
      color: 'var(--mist-100)',
      fontSize: 12,
      fontWeight: 600,
      padding: '6px 14px',
      borderRadius: 'var(--radius-pill)'
    }
  }, `Wholesale Price · ${props.wholesalePrice}`) : null, React.createElement('div', {
    key: 'stock',
    style: {
      marginTop: 14
    }
  }, React.createElement('div', {
    style: {
      display: 'inline-block',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--evergreen-600)',
      background: 'var(--mist-100)',
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)'
    }
  }, props.stockLabel || 'In Stock')), React.createElement('button', {
    key: 'btn',
    style: {
      width: '100%',
      height: 48,
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      background: 'var(--accent-primary)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 14,
      marginTop: 16,
      cursor: 'pointer'
    },
    onClick: props.onAddToCart
  }, 'Add to Cart')]);
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
function Avatar(props) {
  const size = props.size ?? 36;
  return React.createElement('div', {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--accent-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink-900)',
      fontWeight: 600,
      fontSize: size * 0.36,
      fontFamily: 'var(--font-body)',
      flexShrink: 0
    }
  }, props.initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const VARIANTS = {
  primary: {
    bg: 'var(--accent-primary)',
    color: '#fff',
    border: 'none'
  },
  secondary: {
    bg: 'transparent',
    color: 'var(--accent-primary)',
    border: '2px solid var(--accent-primary)'
  },
  ghost: {
    bg: 'transparent',
    color: 'var(--accent-primary)',
    border: 'none',
    textDecoration: 'underline',
    textUnderlineOffset: '4px'
  }
};
function Button(props) {
  const variant = VARIANTS[props.variant || 'primary'];
  const disabled = !!props.disabled;
  const [hover, setHover] = React.useState(false);
  const style = {
    height: 44,
    padding: '0 28px',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 14,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: variant.border,
    textDecoration: variant.textDecoration,
    textUnderlineOffset: variant.textUnderlineOffset,
    background: disabled ? props.variant === 'primary' ? 'var(--accent-secondary)' : 'transparent' : hover ? props.variant === 'primary' ? 'var(--accent-primary-hover)' : props.variant === 'secondary' ? 'var(--surface-tint)' : 'transparent' : variant.bg,
    color: disabled ? props.variant === 'primary' ? '#EAF5EE' : 'var(--accent-secondary)' : hover && props.variant === 'ghost' ? 'var(--accent-primary-hover)' : variant.color,
    opacity: disabled ? 0.7 : 1
  };
  return React.createElement('button', {
    style,
    disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: props.onClick
  }, props.children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
const PATHS = {
  home: '<path d="M4 10.5 12 4l8 6.5"/><path d="M6 9.5V20h5v-6h2v6h5V9.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.5 8H6"/>',
  account: '<circle cx="12" cy="8.5" r="3.3"/><path d="M5.5 20c1-3.6 4-5.5 6.5-5.5s5.5 1.9 6.5 5.5"/>',
  delivery: '<rect x="2.5" y="8" width="10.5" height="8" rx="1.2"/><path d="M13 11h3.5L19.5 14V16h-6.5"/><circle cx="7" cy="18" r="1.6"/><circle cx="16.5" cy="18" r="1.6"/>',
  notification: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  discount: '<path d="M4 4h7l9 9-7 7-9-9Z"/><circle cx="8.3" cy="8.3" r="1.1"/>',
  wallet: '<rect x="3" y="6.5" width="18" height="12" rx="2.4"/><path d="M15.5 12.5h3v3h-3a1.5 1.5 0 0 1 0-3Z"/>',
  shop: '<path d="M4 9.5 5 4h14l1 5.5"/><path d="M4 9.5a2.3 2.3 0 0 0 4.4 1 2.3 2.3 0 0 0 4.4 0 2.3 2.3 0 0 0 4.4 0 2.3 2.3 0 0 0 4.4-1"/><path d="M5.5 11v9h13v-9"/>',
  invoice: '<rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h3.5"/>',
  whatsapp: '<path d="M7 18.5 4 20l1.4-3.4A7.8 7.8 0 1 1 20 11.8 7.8 7.8 0 0 1 7 18.5Z"/><path d="M9 10.3c.3 2 2.2 3.9 4.2 4.2"/>',
  support: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="12.5" width="4" height="5" rx="1.5"/><rect x="17" y="12.5" width="4" height="5" rx="1.5"/><path d="M19 17.5v1a3 3 0 0 1-3 3h-2.5"/>'
};
function Icon(props) {
  const size = props.size ?? 24;
  const inner = PATHS[props.name] || '';
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: props.color || 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: props.style,
    dangerouslySetInnerHTML: {
      __html: inner
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/admin/TopBar.jsx
try { (() => {
function TopBar(props) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, [React.createElement('div', {
    key: 'search',
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--surface-page)',
      borderRadius: 'var(--radius-pill)',
      padding: '8px 16px',
      width: 260
    }
  }, [React.createElement(__ds_scope.Icon, {
    key: 'i',
    name: 'search',
    size: 16,
    color: 'var(--sage-400)'
  }), React.createElement('span', {
    key: 't',
    style: {
      fontSize: 13,
      color: '#8a938e'
    }
  }, props.searchPlaceholder || 'Search products, orders\u2026')]), React.createElement(__ds_scope.Avatar, {
    key: 'av',
    initials: props.initials || 'AR'
  })]);
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/core/Panel.jsx
try { (() => {
function Panel(props) {
  return React.createElement('div', {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: props.padding ?? 28,
      ...props.style
    }
  }, props.children);
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Panel.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusBadge.jsx
try { (() => {
const TONES = {
  success: {
    bg: 'var(--mist-100)',
    color: 'var(--forest-700)',
    dot: 'var(--evergreen-600)'
  },
  warning: {
    bg: 'var(--amber-tint)',
    color: 'var(--amber-ink)',
    dot: 'var(--amber-500)'
  },
  error: {
    bg: 'var(--red-tint)',
    color: 'var(--red-ink)',
    dot: 'var(--red-500)'
  },
  info: {
    bg: 'var(--blue-tint)',
    color: 'var(--blue-ink)',
    dot: 'var(--blue-500)'
  },
  neutral: {
    bg: 'rgba(11,43,38,0.10)',
    color: 'var(--forest-800)',
    dot: 'var(--forest-700)'
  }
};
function StatusBadge(props) {
  const t = TONES[props.tone || 'neutral'];
  return React.createElement('div', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 13,
      fontWeight: 600,
      padding: '8px 16px',
      borderRadius: 'var(--radius-pill)',
      background: t.bg,
      color: t.color,
      whiteSpace: 'nowrap'
    }
  }, [React.createElement('span', {
    key: 'dot',
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: t.dot,
      display: 'inline-block',
      marginRight: 8
    }
  }), props.label, props.urduLabel ? React.createElement('span', {
    key: 'ur',
    dir: 'rtl',
    style: {
      fontFamily: 'var(--font-urdu)',
      marginLeft: 6
    }
  }, props.urduLabel) : null]);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/forms/CheckboxOption.jsx
try { (() => {
function CheckboxOption(props) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer'
    },
    onClick: props.onChange
  }, [React.createElement('div', {
    key: 'box',
    style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      background: props.checked ? 'var(--evergreen-600)' : 'transparent',
      border: props.checked ? 'none' : '2px solid var(--sage-400)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 14,
      flexShrink: 0
    }
  }, props.checked ? '\u2713' : null), React.createElement('span', {
    key: 'label',
    style: {
      fontSize: 14
    }
  }, props.label)]);
}
Object.assign(__ds_scope, { CheckboxOption });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/CheckboxOption.jsx", error: String((e && e.message) || e) }); }

// components/forms/PhoneInput.jsx
try { (() => {
function PhoneInput(props) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      height: 48,
      borderRadius: 'var(--radius-pill)',
      border: '1.5px solid var(--mist-100)',
      background: 'var(--surface-page)'
    }
  }, [React.createElement('div', {
    key: 'code',
    style: {
      background: 'var(--mist-100)',
      color: 'var(--forest-700)',
      fontWeight: 600,
      fontSize: 14,
      padding: '0 14px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 'var(--radius-pill) 0 0 var(--radius-pill)',
      flexShrink: 0
    }
  }, props.countryCode || '+92'), React.createElement('input', {
    key: 'num',
    type: 'tel',
    placeholder: props.placeholder || '300 1234567',
    value: props.value,
    onChange: props.onChange,
    style: {
      flex: 1,
      minWidth: 0,
      width: '100%',
      height: '100%',
      border: 'none',
      padding: '0 14px',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      outline: 'none',
      background: 'transparent',
      borderRadius: '0 var(--radius-pill) var(--radius-pill) 0'
    }
  })]);
}
Object.assign(__ds_scope, { PhoneInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/PhoneInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/QuantityStepper.jsx
try { (() => {
function QuantityStepper(props) {
  const value = props.value ?? 1;
  const btnStyle = {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    fontSize: 18,
    color: 'var(--evergreen-600)',
    cursor: 'pointer'
  };
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: 48,
      borderRadius: 'var(--radius-pill)',
      border: '1.5px solid var(--mist-100)',
      background: 'var(--surface-page)',
      width: 'fit-content'
    }
  }, [React.createElement('button', {
    key: 'dec',
    style: btnStyle,
    onClick: () => props.onChange && props.onChange(Math.max(0, value - 1))
  }, '\u2212'), React.createElement('div', {
    key: 'val',
    style: {
      width: 44,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 600
    }
  }, value), React.createElement('button', {
    key: 'inc',
    style: btnStyle,
    onClick: () => props.onChange && props.onChange(value + 1)
  }, '+')]);
}
Object.assign(__ds_scope, { QuantityStepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/QuantityStepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioOption.jsx
try { (() => {
function RadioOption(props) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, [React.createElement('div', {
    key: 'dot',
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      border: `2px solid ${props.checked ? 'var(--evergreen-600)' : 'var(--sage-400)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexShrink: 0
    },
    onClick: props.onChange
  }, props.checked ? React.createElement('div', {
    style: {
      width: 11,
      height: 11,
      borderRadius: '50%',
      background: 'var(--evergreen-600)'
    }
  }) : null), React.createElement('span', {
    key: 'label',
    style: {
      fontSize: 14
    }
  }, props.label)]);
}
Object.assign(__ds_scope, { RadioOption });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioOption.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select(props) {
  return React.createElement('select', {
    value: props.value,
    onChange: props.onChange,
    style: {
      width: '100%',
      height: 48,
      borderRadius: 'var(--radius-pill)',
      border: '1.5px solid var(--mist-100)',
      padding: '0 20px',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      outline: 'none',
      background: 'var(--surface-page)'
    }
  }, (props.options || []).map(o => React.createElement('option', {
    key: o,
    value: o
  }, o)));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextInput.jsx
try { (() => {
function TextInput(props) {
  return React.createElement('input', {
    type: props.type || 'text',
    placeholder: props.placeholder,
    value: props.value,
    onChange: props.onChange,
    style: {
      width: '100%',
      height: 48,
      borderRadius: 'var(--radius-pill)',
      border: '1.5px solid var(--mist-100)',
      padding: '0 20px',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      outline: 'none',
      background: 'var(--surface-page)',
      ...props.style
    }
  });
}
Object.assign(__ds_scope, { TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextInput.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function BottomNav(props) {
  const items = props.items || [];
  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      background: 'var(--ink-900)',
      borderRadius: 'var(--radius-pill)',
      padding: '12px 8px',
      width: props.width || 280
    }
  }, items.map((it, i) => React.createElement('div', {
    key: i,
    style: {
      textAlign: 'center',
      color: it.active ? 'var(--sage-400)' : 'rgba(255,255,255,0.5)',
      cursor: 'pointer'
    },
    onClick: () => props.onItemClick && props.onItemClick(i)
  }, [React.createElement('div', {
    key: 'dot',
    style: {
      fontSize: 16
    }
  }, '\u25CF'), React.createElement('div', {
    key: 'label',
    style: {
      fontSize: 10,
      marginTop: 2
    }
  }, it.label)])));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NotificationDropdown.jsx
try { (() => {
function NotificationDropdown(props) {
  const blur = props.blur ?? 20;
  return React.createElement('div', {
    style: {
      width: '100%',
      maxWidth: 260,
      background: 'var(--glass-bg)',
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      boxShadow: 'var(--glass-shadow)'
    }
  }, [React.createElement('div', {
    key: 'title',
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ink-900)',
      marginBottom: 10
    }
  }, 'Notifications'), ...(props.items || []).map((item, i) => React.createElement('div', {
    key: i,
    style: {
      fontSize: 12,
      padding: '8px 0',
      borderBottom: i < props.items.length - 1 ? '1px solid rgba(255,255,255,0.5)' : 'none'
    }
  }, item))]);
}
Object.assign(__ds_scope, { NotificationDropdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NotificationDropdown.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PillNavbar.jsx
try { (() => {
function PillNavbar(props) {
  const blur = props.blur ?? 20;
  return React.createElement('div', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 20,
      background: 'var(--glass-bg)',
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-pill)',
      padding: '12px 22px',
      boxShadow: 'var(--glass-shadow)'
    }
  }, [React.createElement('span', {
    key: 'brand',
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--ink-900)'
    }
  }, props.brand || 'Raza'), ...(props.links || []).map(l => React.createElement('span', {
    key: l,
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--forest-700)'
    }
  }, l)), props.children]);
}
Object.assign(__ds_scope, { PillNavbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PillNavbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Dashboard.jsx
try { (() => {
const {
  AdminSidebar,
  TopBar,
  MetricCard,
  DataTable,
  LowStockPanel,
  SimpleLineChart,
  SimpleBarChart,
  StatusBadge
} = window.RazaStationersDesignSystem_64cfb0;
function DashboardScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(MetricCard, {
    label: "Total Sales",
    urduLabel: "\u06A9\u0644 \u0641\u0631\u0648\u062E\u062A",
    value: "Rs 4.82L",
    trend: "8.4%",
    trendDirection: "up"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Orders",
    urduLabel: "\u0622\u0631\u0688\u0631\u0632",
    value: "312",
    trend: "3.1%",
    trendDirection: "up"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Customers",
    urduLabel: "\u06A9\u0633\u0679\u0645\u0631\u0632",
    value: "1,204",
    trend: "1.6%",
    trendDirection: "up"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Low Stock",
    urduLabel: "\u06A9\u0645 \u0633\u0679\u0627\u06A9 \u0627\u0634\u06CC\u0627\u0621",
    value: "9",
    trend: "2 items",
    trendDirection: "down"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: 'var(--sage-400)',
      marginBottom: 16
    }
  }, "Sales \u2014 Last 6 Months"), /*#__PURE__*/React.createElement(SimpleLineChart, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: 'var(--sage-400)',
      marginBottom: 16
    }
  }, "Orders by Category"), /*#__PURE__*/React.createElement(SimpleBarChart, {
    bars: [{
      value: 60
    }, {
      value: 90,
      emphasis: true
    }, {
      value: 40
    }, {
      value: 75,
      emphasis: true
    }, {
      value: 50
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 24,
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: 'var(--sage-400)',
      marginBottom: 16
    }
  }, "Inventory \u2014 Data Table"), /*#__PURE__*/React.createElement(DataTable, {
    columns: ['Product', 'SKU', 'Qty', 'Status', 'Price'],
    rows: [['Classic Ruled Notebook 200pg', 'RS-NB-2004', 180, /*#__PURE__*/React.createElement(StatusBadge, {
      label: "In Stock",
      tone: "success"
    }), 'Rs 145'], ['Gel Pen — Blue (Pack of 10)', 'RS-PN-1180', 6, /*#__PURE__*/React.createElement(StatusBadge, {
      label: "Low Stock",
      tone: "warning"
    }), 'Rs 320'], ['A4 Copier Paper Ream', 'RS-PP-0552', 0, /*#__PURE__*/React.createElement(StatusBadge, {
      label: "Out of Stock",
      tone: "error"
    }), 'Rs 980'], ['Office Stapler Heavy Duty', 'RS-ST-0071', 42, /*#__PURE__*/React.createElement(StatusBadge, {
      label: "In Stock",
      tone: "success"
    }), 'Rs 610']]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: 'var(--sage-400)',
      marginBottom: 16
    }
  }, "Low Stock Alerts"), /*#__PURE__*/React.createElement(LowStockPanel, {
    items: [{
      name: 'Gel Pen — Blue (Pack of 10)',
      qty: 6
    }, {
      name: 'Sticky Notes 3x3',
      qty: 4
    }, {
      name: 'Whiteboard Marker Set',
      qty: 8
    }]
  }))));
}
window.DashboardScreen = DashboardScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Inventory.jsx
try { (() => {
const {
  DataTable,
  StatusBadge,
  TextInput,
  Select
} = window.RazaStationersDesignSystem_64cfb0;
function InventoryScreen() {
  const rows = [['Classic Ruled Notebook 200pg', 'RS-NB-2004', 'Notebooks', 180, /*#__PURE__*/React.createElement(StatusBadge, {
    label: "In Stock",
    tone: "success"
  }), 'Rs 145'], ['Gel Pen — Blue (Pack of 10)', 'RS-PN-1180', 'Pens & Markers', 6, /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Low Stock",
    tone: "warning"
  }), 'Rs 320'], ['A4 Copier Paper Ream', 'RS-PP-0552', 'Paper', 0, /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Out of Stock",
    tone: "error"
  }), 'Rs 980'], ['Office Stapler Heavy Duty', 'RS-ST-0071', 'Office Supplies', 42, /*#__PURE__*/React.createElement(StatusBadge, {
    label: "In Stock",
    tone: "success"
  }), 'Rs 610'], ['Sticky Notes 3x3', 'RS-ST-0132', 'Office Supplies', 4, /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Low Stock",
    tone: "warning"
  }), 'Rs 95'], ['Whiteboard Marker Set', 'RS-PN-1224', 'Pens & Markers', 8, /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Low Stock",
    tone: "warning"
  }), 'Rs 480']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      fontWeight: 600
    }
  }, "Inventory"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 180
    }
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['All Categories', 'Notebooks', 'Pens & Markers', 'Paper', 'Office Supplies']
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 220
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Search SKU or name"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 24,
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: ['Product', 'SKU', 'Category', 'Qty', 'Status', 'Price'],
    rows: rows
  })));
}
window.InventoryScreen = InventoryScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Inventory.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Orders.jsx
try { (() => {
const {
  DataTable,
  StatusBadge,
  Select
} = window.RazaStationersDesignSystem_64cfb0;
function OrdersScreen() {
  const rows = [['#1042', 'Ahmed Raza', 'Jul 22, 2026', 3, 'Rs 610', /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Packed",
    tone: "neutral"
  })], ['#1041', 'Bilal Stationery Shop', 'Jul 22, 2026', 24, 'Rs 12,480', /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Confirmed",
    tone: "success"
  })], ['#1040', 'Sana Traders', 'Jul 21, 2026', 8, 'Rs 3,140', /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Out for Delivery",
    tone: "warning"
  })], ['#1039', 'Fatima Malik', 'Jul 21, 2026', 1, 'Rs 145', /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Delivered",
    tone: "neutral"
  })], ['#1038', 'Zafar Book Depot', 'Jul 20, 2026', 40, 'Rs 18,900', /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Pending Review",
    tone: "info"
  })], ['#1037', 'Usman Khan', 'Jul 20, 2026', 2, 'Rs 640', /*#__PURE__*/React.createElement(StatusBadge, {
    label: "Cancelled",
    tone: "error"
  })]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      fontWeight: 600
    }
  }, "Orders"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 200
    }
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['All Statuses', 'Pending Review', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled']
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 24,
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: ['Order', 'Customer', 'Date', 'Items', 'Total', 'Status'],
    rows: rows
  })));
}
window.OrdersScreen = OrdersScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Orders.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Account.jsx
try { (() => {
const {
  Icon,
  BottomNav,
  CheckboxOption
} = window.RazaStationersDesignSystem_64cfb0;
function AccountScreen(props) {
  const {
    wholesale,
    setWholesale
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 90
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 14px 10px',
      fontSize: 18,
      fontWeight: 600,
      fontFamily: 'var(--font-display)'
    }
  }, "Account"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--sage-400)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      color: 'var(--ink-900)'
    }
  }, "AR"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, "Ahmed Raza"), /*#__PURE__*/React.createElement("div", {
    dir: "rtl",
    style: {
      fontFamily: 'var(--font-urdu)',
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "\u0627\u062D\u0645\u062F \u0631\u0636\u0627"))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px',
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement(CheckboxOption, {
    label: "Send order updates via WhatsApp",
    checked: true,
    onChange: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14
    }
  }), /*#__PURE__*/React.createElement(CheckboxOption, {
    label: "Wholesale pricing view",
    checked: wholesale,
    onChange: () => setWholesale(!wholesale)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '20px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, ['Order History', 'Saved Addresses', 'Support', 'Settings'].map(label => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      padding: '14px 4px',
      borderBottom: '1px solid var(--border-subtle)',
      fontSize: 13,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, label, /*#__PURE__*/React.createElement(Icon, {
    name: label === 'Support' ? 'support' : 'invoice',
    size: 16,
    color: "var(--sage-400)"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(BottomNav, {
    width: 320,
    onItemClick: i => props.goto(['home', 'catalogue', 'cart', 'account'][i]),
    items: [{
      label: 'Home'
    }, {
      label: 'Catalogue'
    }, {
      label: 'Cart'
    }, {
      label: 'Account',
      active: true
    }]
  })));
}
window.AccountScreen = AccountScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Account.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Cart.jsx
try { (() => {
const {
  Icon,
  QuantityStepper,
  RadioOption,
  BottomNav
} = window.RazaStationersDesignSystem_64cfb0;
function CartScreen(props) {
  const {
    cart,
    removeFromCart,
    setQty,
    wholesale
  } = props;
  const [delivery, setDelivery] = React.useState('home');
  const priceOf = p => parseInt((wholesale ? p.wholesalePrice : p.price).replace(/[^0-9]/g, ''), 10);
  const subtotal = cart.reduce((sum, item) => sum + priceOf(item.product) * item.qty, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 90
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 14px 10px',
      fontSize: 18,
      fontWeight: 600,
      fontFamily: 'var(--font-display)'
    }
  }, "Cart"), cart.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '40px 14px',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: 13
    }
  }, "Your cart is empty."), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, cart.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 14,
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'var(--evergreen-600)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.product.icon,
    color: "#fff",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, item.product.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, wholesale ? item.product.wholesalePrice : item.product.price)), /*#__PURE__*/React.createElement(QuantityStepper, {
    value: item.qty,
    onChange: n => n <= 0 ? removeFromCart(i) : setQty(i, n)
  })))), cart.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '20px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 10
    }
  }, "Delivery Options"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(RadioOption, {
    label: "Home Delivery",
    checked: delivery === 'home',
    onChange: () => setDelivery('home')
  }), /*#__PURE__*/React.createElement(RadioOption, {
    label: "Store Pickup",
    checked: delivery === 'pickup',
    onChange: () => setDelivery('pickup')
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal"), /*#__PURE__*/React.createElement("span", null, "Rs ", subtotal.toLocaleString())), /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      height: 48,
      borderRadius: 999,
      border: 'none',
      background: 'var(--evergreen-600)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer'
    }
  }, "Checkout")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(BottomNav, {
    width: 320,
    onItemClick: i => props.goto(['home', 'catalogue', 'cart', 'account'][i]),
    items: [{
      label: 'Home'
    }, {
      label: 'Catalogue'
    }, {
      label: `Cart${cart.length ? ' (' + cart.length + ')' : ''}`,
      active: true
    }, {
      label: 'Account'
    }]
  })));
}
window.CartScreen = CartScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Cart.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Catalogue.jsx
try { (() => {
const {
  Icon,
  ProductCard,
  PillNavbar,
  BottomNav,
  Select
} = window.RazaStationersDesignSystem_64cfb0;
function CatalogueScreen(props) {
  const {
    cart,
    addToCart,
    wholesale
  } = props;
  const products = [{
    id: 1,
    icon: 'invoice',
    category: 'Notebooks',
    name: 'Classic Ruled Notebook — 200 Pages',
    nameUrdu: 'نوٹ بک — 200 صفحات',
    price: 'Rs 145',
    wholesalePrice: 'Rs 118'
  }, {
    id: 2,
    icon: 'discount',
    category: 'Pens & Markers',
    name: 'Gel Pen — Blue (Pack of 10)',
    nameUrdu: 'جیل پین — نیلا',
    price: 'Rs 320',
    wholesalePrice: 'Rs 265'
  }, {
    id: 3,
    icon: 'shop',
    category: 'Paper',
    name: 'A4 Copier Paper Ream',
    nameUrdu: 'اے فور کاغذ',
    price: 'Rs 980',
    wholesalePrice: 'Rs 840'
  }, {
    id: 4,
    icon: 'wallet',
    category: 'Office Supplies',
    name: 'Heavy Duty Stapler',
    nameUrdu: 'اسٹیپلر',
    price: 'Rs 610',
    wholesalePrice: 'Rs 520'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 90
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(PillNavbar, {
    brand: "Raza",
    links: [],
    blur: 20
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    color: "#163832",
    onClick: () => {}
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px 14px',
      fontSize: 18,
      fontWeight: 600,
      fontFamily: 'var(--font-display)'
    }
  }, "Catalogue"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px 16px',
      width: 160
    }
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['All Categories', 'Notebooks', 'Pens & Markers', 'Paper', 'Office Supplies']
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, products.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: 'var(--evergreen-600)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.icon,
    color: "#fff",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.3
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginTop: 8
    }
  }, p.price), wholesale && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--forest-700)',
      fontWeight: 600,
      marginTop: 2
    }
  }, "Wholesale ", p.wholesalePrice), /*#__PURE__*/React.createElement("button", {
    onClick: () => addToCart(p),
    style: {
      marginTop: 10,
      width: '100%',
      height: 36,
      borderRadius: 999,
      border: 'none',
      background: 'var(--evergreen-600)',
      color: '#fff',
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Add to Cart"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(BottomNav, {
    width: 320,
    onItemClick: i => props.goto(['home', 'catalogue', 'cart', 'account'][i]),
    items: [{
      label: 'Home'
    }, {
      label: 'Catalogue',
      active: true
    }, {
      label: `Cart${cart.length ? ' (' + cart.length + ')' : ''}`
    }, {
      label: 'Account'
    }]
  })));
}
window.CatalogueScreen = CatalogueScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Catalogue.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Home.jsx
try { (() => {
const {
  Icon,
  Button,
  ProductCard,
  PillNavbar,
  BottomNav,
  QuantityStepper
} = window.RazaStationersDesignSystem_64cfb0;
function HomeScreen(props) {
  const {
    cart,
    addToCart,
    wholesale
  } = props;
  const categories = [{
    name: 'Notebooks',
    icon: 'invoice'
  }, {
    name: 'Pens & Markers',
    icon: 'discount'
  }, {
    name: 'Paper',
    icon: 'shop'
  }, {
    name: 'Office Supplies',
    icon: 'wallet'
  }];
  const products = [{
    id: 1,
    icon: 'invoice',
    category: 'Notebooks',
    name: 'Classic Ruled Notebook — 200 Pages',
    nameUrdu: 'نوٹ بک — 200 صفحات',
    price: 'Rs 145',
    wholesalePrice: 'Rs 118'
  }, {
    id: 2,
    icon: 'discount',
    category: 'Pens & Markers',
    name: 'Gel Pen — Blue (Pack of 10)',
    nameUrdu: 'جیل پین — نیلا',
    price: 'Rs 320',
    wholesalePrice: 'Rs 265'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 90
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(PillNavbar, {
    brand: "Raza",
    links: [],
    blur: 20
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    color: "#163832"
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "cart",
    size: 16,
    color: "#163832"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px 16px',
      background: 'var(--forest-700)',
      borderRadius: 14,
      padding: 20,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      fontWeight: 600
    }
  }, "Wholesale Pricing"), /*#__PURE__*/React.createElement("div", {
    dir: "rtl",
    style: {
      fontFamily: 'var(--font-urdu)',
      fontSize: 15,
      color: 'var(--sage-400)',
      marginTop: 2
    }
  }, "\u06C1\u0648\u0644 \u0633\u06CC\u0644 \u0642\u06CC\u0645\u062A\u06CC\u06BA"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--mist-100)',
      marginTop: 8
    }
  }, "Register your shop to unlock lower per-unit pricing.")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px 16px',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--ink-900)'
    }
  }, "Shop by Category"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px 20px',
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 10
    }
  }, categories.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon,
    color: "var(--evergreen-600)",
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      marginTop: 6
    }
  }, c.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px 10px',
      fontSize: 13,
      fontWeight: 600
    }
  }, "New Arrivals"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, products.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16
    }
  }, /*#__PURE__*/React.createElement(ProductCard, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: p.icon,
      color: "#fff"
    }),
    category: p.category,
    name: p.name,
    nameUrdu: p.nameUrdu,
    price: p.price,
    wholesalePrice: wholesale ? p.wholesalePrice : undefined,
    stockLabel: "In Stock",
    onAddToCart: () => addToCart(p)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(BottomNav, {
    width: 320,
    onItemClick: i => props.goto(['home', 'catalogue', 'cart', 'account'][i]),
    items: [{
      label: 'Home',
      active: true
    }, {
      label: 'Catalogue'
    }, {
      label: `Cart${cart.length ? ' (' + cart.length + ')' : ''}`
    }, {
      label: 'Account'
    }]
  })));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Home.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AdminSidebar = __ds_scope.AdminSidebar;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.LowStockPanel = __ds_scope.LowStockPanel;

__ds_ns.MetricCard = __ds_scope.MetricCard;

__ds_ns.SimpleBarChart = __ds_scope.SimpleBarChart;

__ds_ns.SimpleLineChart = __ds_scope.SimpleLineChart;

__ds_ns.TopBar = __ds_scope.TopBar;

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.CheckboxOption = __ds_scope.CheckboxOption;

__ds_ns.PhoneInput = __ds_scope.PhoneInput;

__ds_ns.QuantityStepper = __ds_scope.QuantityStepper;

__ds_ns.RadioOption = __ds_scope.RadioOption;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.NotificationDropdown = __ds_scope.NotificationDropdown;

__ds_ns.PillNavbar = __ds_scope.PillNavbar;

})();
