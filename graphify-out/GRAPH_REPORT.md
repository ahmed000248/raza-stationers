# Graph Report - .  (2026-07-31)

## Corpus Check
- Large corpus: 884 files ╖ ~892,625 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 4378 nodes · 8595 edges · 283 communities (217 shown, 66 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 311 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- GSAP Animation Core Library
- GSAP Plugins & Utilities
- GSAP Text & Layout Plugins
- GSAP DevTools Minified Component
- Mobile Application Interface Support
- Admin Dashboard Design Support
- Shared UI Design Components
- Storefront UI Design Support
- Shared API Client Services
- GSAP ScrollTrigger Animation Services
- Storefront Motion Components
- GSAP Core Timeline Controls
- Backend NestJS Catalogue APIs
- GSAP Minified Script Library
- GSAP Smooth Scroll Utilities
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 173
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184
- Community 185
- Community 186
- Community 187
- Community 188
- Community 189
- Community 190
- Community 191
- Community 192
- Community 193
- Community 194
- Community 195
- Community 196
- Community 197
- Community 198
- Community 199
- Community 200
- Community 201
- Community 202
- Community 203
- Community 204
- Community 205
- Community 207
- Community 208
- Community 209
- Community 210
- Community 211
- Community 212
- Community 213
- Community 214
- Community 215
- Community 217
- Community 218
- Community 219
- Community 220
- Community 221
- Community 222
- Community 228
- Community 229
- Community 230
- Community 231
- Community 232
- Community 233
- Community 234
- Community 235
- Community 237
- Community 238
- Community 239
- Community 240
- Community 241
- Community 242
- Community 243
- Community 244
- Community 245
- Community 246
- Community 247
- Community 248
- Community 249
- Community 250
- Community 251
- Community 252
- Community 253
- Community 254
- Community 255
- Community 256
- Community 257
- Community 258
- Community 259
- Community 260
- Community 261
- Community 262
- Community 263
- Community 274

## God Nodes (most connected - your core abstractions)
1. `cn()` - 67 edges
2. `RazaAPIClient` - 54 edges
3. `PrismaService` - 43 edges
4. `useAdminShell()` - 41 edges
5. `createAPIClient()` - 41 edges
6. `PathEditor` - 38 edges
7. `cn()` - 38 edges
8. `Timeline` - 37 edges
9. `ScrollTrigger` - 33 edges
10. `Animation` - 32 edges

## Surprising Connections (you probably didn't know these)
- `ProductCataloguePage()` --calls--> `createAPIClient()`  [EXTRACTED]
  apps/admin/src/app/catalogue/page.tsx → packages/api/src/index.ts
- `ClientBusinessesPage()` --calls--> `createAPIClient()`  [EXTRACTED]
  apps/admin/src/app/client-businesses/page.tsx → packages/api/src/index.ts
- `AccountingPage()` --calls--> `createAPIClient()`  [EXTRACTED]
  apps/admin/src/app/accounting/page.tsx → packages/api/src/index.ts
- `DashboardPage()` --calls--> `createAPIClient()`  [EXTRACTED]
  apps/admin/src/app/dashboard/page.tsx → packages/api/src/index.ts
- `DeliveryManagementPage()` --calls--> `createAPIClient()`  [EXTRACTED]
  apps/admin/src/app/delivery/page.tsx → packages/api/src/index.ts

## Import Cycles
- None detected.

## Communities (283 total, 66 thin omitted)

### Community 0 - "GSAP Animation Core Library"
Cohesion: 0.04
Nodes (86): _addAliasesToVars(), _addGlobal(), _addModifiers(), _addPluginModifier(), _addPropTween(), _arraysMatch(), _colorLookup, _colorOrderData() (+78 more)

### Community 1 - "GSAP Plugins & Utilities"
Cohesion: 0.05
Nodes (56): _addNonTweeningPT(), _addPxTranslate(), _addRawTransformPTs(), _addRotationalPropTween(), _applySVGOrigin(), _assign(), _checkPropPrefix(), _convertToUnit() (+48 more)

### Community 2 - "GSAP Text & Layout Plugins"
Cohesion: 0.04
Nodes (50): CreditStatusCard(), CreditStatusCardProps, ProductUnitSelector(), ProductUnitSelectorProps, mockDiscountChangeLogs, mockStaffMembers, mockStockMovements, StaffWithUser (+42 more)

### Community 3 - "GSAP DevTools Minified Component"
Cohesion: 0.06
Nodes (52): A(), aa(), _assertThisInitialized(), Ba(), da(), Draggable(), Ea(), Eb() (+44 more)

### Community 4 - "Mobile Application Interface Support"
Cohesion: 0.07
Nodes (51): boot(), cdnScriptFor(), collectProps(), compileAttr(), compileTemplate(), contentKey(), createComponentFactory(), createHelmetManager() (+43 more)

### Community 5 - "Admin Dashboard Design Support"
Cohesion: 0.07
Nodes (51): boot(), cdnScriptFor(), collectProps(), compileAttr(), compileTemplate(), contentKey(), createComponentFactory(), createHelmetManager() (+43 more)

### Community 6 - "Shared UI Design Components"
Cohesion: 0.07
Nodes (49): Badge(), BadgeProps, badgeVariants, Bilingual(), BilingualProps, Card, CardContent, CardDescription (+41 more)

### Community 7 - "Storefront UI Design Support"
Cohesion: 0.07
Nodes (48): boot(), cdnScriptFor(), collectProps(), compileAttr(), compileTemplate(), contentKey(), createComponentFactory(), createHelmetManager() (+40 more)

### Community 9 - "GSAP ScrollTrigger Animation Services"
Cohesion: 0.08
Nodes (51): _getProxyProp(), _callback(), _copyState(), _createMarker(), _defaults, _emptyArray, _endAnimation(), _getBounds() (+43 more)

### Community 10 - "Storefront Motion Components"
Cohesion: 0.08
Nodes (41): FadeIn(), FadeInProps, SkeletonBlock(), SkeletonBlockProps, mockNotifications, NotificationDropdown(), NotificationItem, typeIconMap (+33 more)

### Community 11 - "GSAP Core Timeline Controls"
Cohesion: 0.11
Nodes (15): _addToTimeline(), _alignPlayhead(), Animation, _animationCycle(), _clamp(), _elapsedCycleDuration(), _isRevertWorthy(), _onUpdateTotalDuration() (+7 more)

### Community 12 - "Backend NestJS Catalogue APIs"
Cohesion: 0.08
Nodes (24): ApiPropertyOptional, CatalogueController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get (+16 more)

### Community 13 - "GSAP Minified Script Library"
Cohesion: 0.06
Nodes (25): Context(), Db(), fb(), Gw(), ia(), ja(), kb(), Lc() (+17 more)

### Community 14 - "GSAP Smooth Scroll Utilities"
Cohesion: 0.08
Nodes (5): ScrollSmoother(), _getTarget(), ScrollTrigger, ScrollSmoother(), ScrollSmoother()

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (34): Anchor(), arcToSegment(), ba(), C(), Ca(), copyRawPath(), Da(), db() (+26 more)

### Community 16 - "Community 16"
Cohesion: 0.10
Nodes (26): _calculateChange(), _calculateDuration(), _calculateTweenDuration(), _deepClone(), _extend(), _getClosest(), _getGSAP(), _getNumOrDefault() (+18 more)

### Community 17 - "Community 17"
Cohesion: 0.09
Nodes (11): _createTweenType(), _getLabelInDirection(), _hasNoPausedAncestors(), _inheritDefaults(), _isNotFalse(), _parseKeyframe(), _parsePosition(), _setDefaults() (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.05
Nodes (38): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+30 more)

### Community 19 - "Community 19"
Cohesion: 0.05
Nodes (38): concurrently, graphifyy, @mermaid-js/mermaid-cli, dependencies, graphifyy, lucide-react, devDependencies, concurrently (+30 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (25): RFC-4180, main(), CatalogueImporter, generateSlug(), getSslConfig(), parseCatalogueCsv(), parseCatalogueXlsx(), parseCsvText() (+17 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (13): AuthModule, Module, CurrentUser, Roles(), JwtAuthGuard, Injectable, RolesGuard, Injectable (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (28): A(), Aa(), B(), ba(), ea(), fa(), FlipState(), ga() (+20 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (10): createExternalModules(), flushNow(), getSlot(), ImageSlot, load(), save(), setSlot(), toDataUrl() (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.08
Nodes (26): AuditLogPage(), fontHeading, fontSans, fontUrdu, metadata, SettingsPage(), StaffManagementPage(), AuditTimeline() (+18 more)

### Community 25 - "Community 25"
Cohesion: 0.11
Nodes (32): _addListener(), _allowNativePanning(), _captureInputs(), _clampScrollAndGetDurationMultiplier(), _clearScrollMemory(), _dispatch(), _getScrollNormalizer(), _getTweenCreator() (+24 more)

### Community 26 - "Community 26"
Cohesion: 0.06
Nodes (33): dependencies, @base-ui/react, class-variance-authority, clsx, framer-motion, lucide-react, tailwind-merge, devDependencies (+25 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (16): ClientsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+8 more)

### Community 28 - "Community 28"
Cohesion: 0.10
Nodes (17): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+9 more)

### Community 29 - "Community 29"
Cohesion: 0.13
Nodes (19): AccountPageContent(), CheckoutPage(), WholesaleRegistrationPage(), SignInPage(), PendingVerificationNotice(), PendingVerificationNoticeProps, SignInModal(), SignInModalProps (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (29): A(), aa(), _assertThisInitialized(), Ba(), da(), Draggable(), Ea(), fa() (+21 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (29): _addAnchorsToBezier(), _buildPointsFilter(), _cloneAndSortRawPath(), _equalizePointQuantity(), _equalizeSegmentQuantity(), _getAverageXY(), _getClosestAnchor(), _getClosestSegment() (+21 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (26): arcToSegment(), ba(), ca(), cacheRawPathMeasurements(), convertToPath(), D(), da(), ea() (+18 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (29): _addColorMatrixFilterCacheTween(), _addColorTween(), _addRotationalPropTween(), _applyBrightnessToMatrix(), _applyMatrix(), _CMFdefaults, _colorize(), _colorMatrixFilterProps (+21 more)

### Community 34 - "Community 34"
Cohesion: 0.07
Nodes (5): _createClass(), _defineProperties(), getClosestData(), getClosestProgressOnBezier(), MotionPathHelper()

### Community 35 - "Community 35"
Cohesion: 0.09
Nodes (26): addToCart(), BRAND, cartCount(), cartLines(), cartSubtotal(), CATEGORIES, clearCart(), CONTACT (+18 more)

### Community 36 - "Community 36"
Cohesion: 0.06
Nodes (31): dependencies, pg, @prisma/adapter-pg, @prisma/client, @raza-stationers/types, zod, devDependencies, prisma (+23 more)

### Community 37 - "Community 37"
Cohesion: 0.14
Nodes (8): _addHistory(), _checkDeselect(), _createElement(), _createSegmentAnchors(), _emptyFunc(), _initCore(), PathEditor, _resetSelection()

### Community 38 - "Community 38"
Cohesion: 0.06
Nodes (30): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+22 more)

### Community 39 - "Community 39"
Cohesion: 0.10
Nodes (21): CatalogueContent(), CataloguePagination(), CataloguePaginationProps, CatalogueSearchInput(), CategoryFilter(), CategoryFilterProps, ProductCard(), PurchaseTypeFilter (+13 more)

### Community 40 - "Community 40"
Cohesion: 0.12
Nodes (22): Props, CartLineItem(), CartLineItemProps, CategorySection(), HOME_CATEGORIES, AddToCartButton(), AddToCartButtonProps, QuantityStepper() (+14 more)

### Community 41 - "Community 41"
Cohesion: 0.07
Nodes (4): ic(), Ka(), La(), rb()

### Community 42 - "Community 42"
Cohesion: 0.11
Nodes (26): _addToRenderQueue(), _copy(), _extend(), _getBounds(), _getComputedStyle(), _getDocScrollLeft(), _getDocScrollTop(), _getElementBounds() (+18 more)

### Community 43 - "Community 43"
Cohesion: 0.10
Nodes (27): _absoluteProps, _batchLookup, _bodyMetrics, _bodyProps, _callbacks, _camelToDashed(), _dashedNameLookup, _emptyObj (+19 more)

### Community 44 - "Community 44"
Cohesion: 0.11
Nodes (24): BoundingRect, ContextFunction, LineWrapperFunction, PrepareTextFunction, SplitText, SplitTextConfig, SplitTextOriginal, SplitTextTarget (+16 more)

### Community 45 - "Community 45"
Cohesion: 0.13
Nodes (22): AccountScreen(), BottomNav(), CartScreen(), CatalogueScreen(), CheckboxOption(), DashboardScreen(), DataTable(), HomeScreen() (+14 more)

### Community 46 - "Community 46"
Cohesion: 0.13
Nodes (22): AccountScreen(), BottomNav(), CartScreen(), CatalogueScreen(), CheckboxOption(), DashboardScreen(), DataTable(), HomeScreen() (+14 more)

### Community 47 - "Community 47"
Cohesion: 0.11
Nodes (20): ClientBusinessesPage(), ClientDrawer(), ClientDrawerProps, TIER_OPTIONS, ClientFilterBar(), ClientFilterBarProps, ClientFilterType, FILTERS (+12 more)

### Community 48 - "Community 48"
Cohesion: 0.11
Nodes (14): AccountingController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Post (+6 more)

### Community 49 - "Community 49"
Cohesion: 0.11
Nodes (16): OrdersController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+8 more)

### Community 50 - "Community 50"
Cohesion: 0.14
Nodes (15): metadata, BusinessProfileTab(), NotificationPreferencesTab(), mockNotifications, NotificationsFeedTab(), mockStaff, StaffTab(), GuestCtaBanner() (+7 more)

### Community 51 - "Community 51"
Cohesion: 0.10
Nodes (12): f(), g(), h(), i(), l(), _arrayContainsAny(), Context, _dispatch() (+4 more)

### Community 52 - "Community 52"
Cohesion: 0.11
Nodes (15): InventoryController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+7 more)

### Community 53 - "Community 53"
Cohesion: 0.11
Nodes (15): StaffController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+7 more)

### Community 54 - "Community 54"
Cohesion: 0.14
Nodes (20): D(), E(), Ec(), Fc(), Gc(), J(), Jc(), L() (+12 more)

### Community 55 - "Community 55"
Cohesion: 0.16
Nodes (26): _addListener(), _buildLoopAnimation(), _buildPlayPauseMorph(), _checkIndependence(), _clearSelection(), _createElement(), _createRootElement(), _getAnimationById() (+18 more)

### Community 56 - "Community 56"
Cohesion: 0.12
Nodes (14): DeliveryController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, Post (+6 more)

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (21): arcToSegment(), cacheRawPathMeasurements(), convertToPath(), copyRawPath(), flatPointsToSegment(), getPositionOnPath(), getProgressData(), getRawPath() (+13 more)

### Community 58 - "Community 58"
Cohesion: 0.12
Nodes (14): ReturnsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+6 more)

### Community 59 - "Community 59"
Cohesion: 0.14
Nodes (20): arcToSegment(), ca(), cacheRawPathMeasurements(), D(), getPositionOnPath(), getProgressData(), getRawPath(), getRotationAtBezierT() (+12 more)

### Community 60 - "Community 60"
Cohesion: 0.14
Nodes (25): _sliceModifier(), _appendOrMerge(), arcToSegment(), _attrToObj(), convertToPath(), _createPath(), getClosestData(), getClosestProgressOnBezier() (+17 more)

### Community 61 - "Community 61"
Cohesion: 0.14
Nodes (21): _addListener(), _bridge(), _getAbsoluteMax(), _getEvent(), _getGSAP(), _getScrollFunc(), _getVelocityProp(), _horizontal (+13 more)

### Community 62 - "Community 62"
Cohesion: 0.16
Nodes (17): CartPage(), OrderConfirmationPage(), Props, OrderTrackingPage(), Props, ProductDetailPage(), MinOrderNotice(), MinOrderNoticeProps (+9 more)

### Community 63 - "Community 63"
Cohesion: 0.13
Nodes (21): _addListener(), _bind(), _createSVG(), _editingAxis, _getCirclePathData(), _getConcatenatedTransforms(), _getConsolidatedMatrix(), _getSquarePathData() (+13 more)

### Community 64 - "Community 64"
Cohesion: 0.14
Nodes (23): main(), Path, analyse_rows(), _cell_value_ooxml(), col_letter_to_index(), cross_check(), find_col(), has_control_chars() (+15 more)

### Community 65 - "Community 65"
Cohesion: 0.13
Nodes (16): DashboardPage(), CategoryBars(), KpiTile(), KpiTileProps, LowStockList(), RecentOrdersList(), SalesLineChart(), CategoryBarItem (+8 more)

### Community 66 - "Community 66"
Cohesion: 0.13
Nodes (11): JwtPayload, JwtStrategy, Injectable, BaseRepository, Injectable, PrismaModule, Module, getSslConfig() (+3 more)

### Community 67 - "Community 67"
Cohesion: 0.14
Nodes (13): PricingController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, Query (+5 more)

### Community 68 - "Community 68"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 69 - "Community 69"
Cohesion: 0.10
Nodes (17): PaymentMethodPicker(), PaymentMethodPickerProps, CheckoutFormData, checkoutFormSchema, DeliveryAddressFormData, deliveryAddressSchema, DiscountRuleFormData, discountRuleSchema (+9 more)

### Community 70 - "Community 70"
Cohesion: 0.16
Nodes (19): constructor(), _context(), _defaultContext, _disallowInline(), _elements(), _emojiSafeRegEx, _emptyArray, _emptyBounds (+11 more)

### Community 71 - "Community 71"
Cohesion: 0.17
Nodes (19): A(), B(), E(), F(), I(), l(), m(), n() (+11 more)

### Community 72 - "Community 72"
Cohesion: 0.16
Nodes (18): _addLinkedListItem(), _attemptInitTween(), _callback(), _checkPlugin(), init(), _initTween(), _interrupt(), _isFromOrFromStart() (+10 more)

### Community 73 - "Community 73"
Cohesion: 0.16
Nodes (19): constructor(), _emojiSafeRegEx, _context(), _defaultContext, _disallowInline(), _elements(), _emptyArray, _emptyBounds (+11 more)

### Community 74 - "Community 74"
Cohesion: 0.13
Nodes (13): SettingsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Put (+5 more)

### Community 75 - "Community 75"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+13 more)

### Community 76 - "Community 76"
Cohesion: 0.19
Nodes (7): _autoDistance(), _getGSAP(), _maxScroll(), _round(), ScrollSmoother, _windowExists(), _wrap()

### Community 77 - "Community 77"
Cohesion: 0.10
Nodes (20): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+12 more)

### Community 78 - "Community 78"
Cohesion: 0.19
Nodes (15): ProductCataloguePage(), BulkImportModal(), BulkImportModalProps, MOCK_CSV_PREVIEW_ROWS, ParsedImportRow, CategoryFilterBar(), CategoryFilterBarProps, ProductGrid() (+7 more)

### Community 79 - "Community 79"
Cohesion: 0.16
Nodes (15): AdminLoginPage(), AdminNav(), NAV_ITEMS, NavItem, AddToastInput, AdminShell(), AdminShellContext, AdminShellContextValue (+7 more)

### Community 80 - "Community 80"
Cohesion: 0.18
Nodes (15): StockManagementPage(), LogRestockDialog(), LogRestockDialogProps, LowStockTable(), LowStockTableProps, StockCorrectionDialog(), StockCorrectionDialogProps, StockEntriesTable() (+7 more)

### Community 81 - "Community 81"
Cohesion: 0.16
Nodes (14): MorphSVGPlugin, MotionPathPlugin, CharSet, _charsLookup, _getGSAP(), _initCore(), _lower, _scrambleText() (+6 more)

### Community 82 - "Community 82"
Cohesion: 0.16
Nodes (16): aa(), da(), fa(), L(), m(), N(), O(), p() (+8 more)

### Community 83 - "Community 83"
Cohesion: 0.16
Nodes (11): _bezierToPoints(), CustomEase, _findMinimum(), _getGSAP(), _initCore(), _normalize(), _round(), _copyMetaData() (+3 more)

### Community 84 - "Community 84"
Cohesion: 0.24
Nodes (15): _addListener(), _addScrollListener(), _getMaxScroll(), _isRoot(), _onMultiTouchDocument(), _onMultiTouchDocumentEnd(), _recordMaxScrolls(), _removeFromRenderQueue() (+7 more)

### Community 85 - "Community 85"
Cohesion: 0.10
Nodes (15): AUDIT_LOG, CATEGORIES, CATEGORY_BARS, CLIENTS, DELIVERY_STAFF, DISCOUNT_TIERS, EXPENSES, NAV_ITEMS (+7 more)

### Community 86 - "Community 86"
Cohesion: 0.16
Nodes (15): OrderQueuePage(), OrderDetailDrawer(), OrderDetailDrawerProps, FILTER_ITEMS, OrderFilterBar(), OrderFilterBarProps, OrderFilterType, OrderTable() (+7 more)

### Community 87 - "Community 87"
Cohesion: 0.15
Nodes (12): AppController, ApiOperation, ApiTags, Controller, Get, AppModule, Module, AppService (+4 more)

### Community 88 - "Community 88"
Cohesion: 0.15
Nodes (11): AuthController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Post, Put (+3 more)

### Community 89 - "Community 89"
Cohesion: 0.14
Nodes (9): ApiOperation, Body, Get, Param, Post, InvoicingModule, Module, InvoicingService (+1 more)

### Community 90 - "Community 90"
Cohesion: 0.21
Nodes (17): _applyInlineStyles(), _applyProps(), _copy(), _fit(), _getInverseGlobalMatrix(), _makeAbsolute(), _createSibling(), _divTemps (+9 more)

### Community 91 - "Community 91"
Cohesion: 0.14
Nodes (12): AuditController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Query, UseGuards (+4 more)

### Community 92 - "Community 92"
Cohesion: 0.16
Nodes (11): DashboardController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, UseGuards, DashboardModule (+3 more)

### Community 93 - "Community 93"
Cohesion: 0.16
Nodes (11): ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, UseGuards, UsersController, Module (+3 more)

### Community 94 - "Community 94"
Cohesion: 0.11
Nodes (19): dependencies, @base-ui/react, gsap, @gsap/react, lenis, motion, react-dom, tailwind-merge (+11 more)

### Community 95 - "Community 95"
Cohesion: 0.11
Nodes (19): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+11 more)

### Community 96 - "Community 96"
Cohesion: 0.16
Nodes (19): _a(), Ao(), cb(), cc(), Eb(), ga(), gb(), ha() (+11 more)

### Community 97 - "Community 97"
Cohesion: 0.12
Nodes (7): _consolidate(), Matrix2D, _setMatrix(), getGlobalMatrix(), getGlobalMatrix(), getGlobalMatrix(), getGlobalMatrix()

### Community 98 - "Community 98"
Cohesion: 0.18
Nodes (13): arcToSegment(), cacheRawPathMeasurements(), convertToPath(), copyRawPath(), getPositionOnPath(), getProgressData(), getRawPath(), getRotationAtBezierT() (+5 more)

### Community 99 - "Community 99"
Cohesion: 0.14
Nodes (14): fontHeading, fontSans, fontUrdu, metadata, StaffMember, ProductCardProps, SiteFooter(), AccountStatus (+6 more)

### Community 100 - "Community 100"
Cohesion: 0.14
Nodes (8): arcToSegment(), getClosestData(), getClosestProgressOnBezier(), MotionPathHelper(), pointToSegDist(), simplifyPoints(), simplifyStep(), stringToRawPath()

### Community 101 - "Community 101"
Cohesion: 0.12
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 102 - "Community 102"
Cohesion: 0.23
Nodes (12): DeliveryManagementPage(), ActiveDeliveriesList(), ActiveDeliveriesListProps, DeliveryOutcomeModal(), DeliveryOutcomeModalProps, ReadyDispatchTable(), ReadyDispatchTableProps, useAdminShell() (+4 more)

### Community 103 - "Community 103"
Cohesion: 0.15
Nodes (17): Ae(), ce(), $d(), ee(), he(), ka(), le(), ma() (+9 more)

### Community 104 - "Community 104"
Cohesion: 0.15
Nodes (6): _assertThisInitialized(), Draggable(), getGlobalMatrix(), _assertThisInitialized(), Draggable(), getGlobalMatrix()

### Community 105 - "Community 105"
Cohesion: 0.25
Nodes (16): _applyMatrix(), _cache(), _colorize(), _colorProps, EaselPlugin, _getCreateJS(), _getGSAP(), _idMatrix (+8 more)

### Community 107 - "Community 107"
Cohesion: 0.18
Nodes (5): _assertThisInitialized(), Draggable(), NOTE: "force" is actually the "time" when this method gets called by the gsap.ti, getGlobalMatrix(), Matrix2D()

### Community 108 - "Community 108"
Cohesion: 0.24
Nodes (15): DrawSVGPlugin, _getAttributeAsNumber(), _getDistance(), _getGSAP(), _getLength(), _getPosition(), _hasNonScalingStroke(), _initCore() (+7 more)

### Community 110 - "Community 110"
Cohesion: 0.24
Nodes (13): _addCopyToClipboard(), _createElement(), _findMotionPathTween(), _getConsolidatedMatrix(), _getGlobalTime(), _getInitialPath(), _getPositionOnPage(), _identityMatrixObject (+5 more)

### Community 111 - "Community 111"
Cohesion: 0.13
Nodes (15): dependencies, class-variance-authority, clsx, @raza-stationers/api, @raza-stationers/types, @raza-stationers/ui, react, tailwind-merge (+7 more)

### Community 112 - "Community 112"
Cohesion: 0.13
Nodes (15): dependencies, bcryptjs, class-transformer, class-validator, @nestjs/jwt, @nestjs/swagger, @prisma/client, rxjs (+7 more)

### Community 113 - "Community 113"
Cohesion: 0.13
Nodes (15): devDependencies, @nestjs/cli, @nestjs/schematics, ts-node, @types/express, @types/node, @types/passport-jwt, typescript (+7 more)

### Community 114 - "Community 114"
Cohesion: 0.13
Nodes (14): dependencies, @raza-stationers/types, devDependencies, typescript, @raza-stationers/types, typescript, main, name (+6 more)

### Community 115 - "Community 115"
Cohesion: 0.13
Nodes (14): dependencies, zod, devDependencies, typescript, typescript, zod, main, name (+6 more)

### Community 116 - "Community 116"
Cohesion: 0.21
Nodes (9): AddStaffModal(), AddStaffModalProps, StaffTable(), StaffTableProps, MOCK_STAFF_MEMBERS, StaffMember, Button(), buttonVariants (+1 more)

### Community 117 - "Community 117"
Cohesion: 0.18
Nodes (6): ElementState, _getChangingElState(), _getID(), _recordProps(), _round(), _getCTM()

### Community 118 - "Community 118"
Cohesion: 0.16
Nodes (5): _findElStateInState(), Flip, _getEl(), _parseElementState(), _parseState()

### Community 119 - "Community 119"
Cohesion: 0.24
Nodes (14): _getDefaultSmoothPoints(), _segmentCanBeIgnored(), _smoothRawPath(), cacheRawPathMeasurements(), getPositionOnPath(), getProgressData(), getRotationAtBezierT(), getRotationAtProgress() (+6 more)

### Community 120 - "Community 120"
Cohesion: 0.23
Nodes (11): _addDimensionalPropTween(), _align(), _emptyFunc(), _getAlignMatrix(), _getPropNum(), _originToPoint(), _relativize(), _segmentToRawPath() (+3 more)

### Community 121 - "Community 121"
Cohesion: 0.23
Nodes (6): _assertThisInitialized(), PropTween(), TODO: repeat: Infinity on a timeline's children must flag that timeline internal, NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes proble, Timeline(), Tween()

### Community 122 - "Community 122"
Cohesion: 0.26
Nodes (7): DraggableSVG(), DraggableSVG, _onMove(), _onPress(), _preventDefault(), DraggableSVG(), DraggableSVG()

### Community 123 - "Community 123"
Cohesion: 0.32
Nodes (12): A(), B(), l(), m(), p(), q(), r(), s() (+4 more)

### Community 124 - "Community 124"
Cohesion: 0.21
Nodes (13): _assertThisInitialized(), Gc(), Hc(), ic(), t(), ta(), Timeline(), Tween() (+5 more)

### Community 125 - "Community 125"
Cohesion: 0.21
Nodes (6): _createElement(), Draggable, _emptyFunc(), _getGSAP(), _initCore(), _windowExists()

### Community 126 - "Community 126"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, module, moduleResolution, noEmit, outDir, skipLibCheck (+4 more)

### Community 127 - "Community 127"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, jsx, module, moduleResolution, noEmit, skipLibCheck (+4 more)

### Community 128 - "Community 128"
Cohesion: 0.17
Nodes (11): dependencies, @raza-stationers/api, @raza-stationers/types, @raza-stationers/api, @raza-stationers/types, name, private, scripts (+3 more)

### Community 129 - "Community 129"
Cohesion: 0.20
Nodes (12): C(), Dc(), Ia(), Ja(), pb(), tc(), vc(), Wa() (+4 more)

### Community 130 - "Community 130"
Cohesion: 0.21
Nodes (9): _boolean(), _createRoughEase(), _createSlowMo(), EasePack, ExpoScaleEase, _getGSAP(), _initCore(), RoughEase (+1 more)

### Community 131 - "Community 131"
Cohesion: 0.26
Nodes (8): arcToSegment(), cacheRawPathMeasurements(), convertToPath(), getRawPath(), measureSegment(), rawPathToString(), segmentToDistributedPoints(), stringToRawPath()

### Community 132 - "Community 132"
Cohesion: 0.17
Nodes (11): devDependencies, typescript, typescript, main, name, private, scripts, build (+3 more)

### Community 133 - "Community 133"
Cohesion: 0.24
Nodes (7): AccountingPage(), ExpensesAndOutstandingGrid(), ExpensesAndOutstandingGridProps, FinancialTiles(), FinancialTilesProps, SalesTrendChart(), SalesTrendChartProps

### Community 134 - "Community 134"
Cohesion: 0.22
Nodes (11): Aa(), Animation(), Ca(), Da(), la(), na(), Ua(), Va() (+3 more)

### Community 135 - "Community 135"
Cohesion: 0.24
Nodes (8): T(), V(), convertToPath(), rawPathToString(), constructor(), kill(), revert(), split()

### Community 136 - "Community 136"
Cohesion: 0.27
Nodes (11): jf(), lf(), mf(), N(), nf(), O(), of(), tf() (+3 more)

### Community 137 - "Community 137"
Cohesion: 0.22
Nodes (7): ScrollTrigger(), _getGSAP(), _windowExists(), ScrollTrigger(), _createClass(), _defineProperties(), ScrollTrigger()

### Community 138 - "Community 138"
Cohesion: 0.29
Nodes (6): _create(), CustomWiggle, _eases, _getGSAP(), _initCore(), _parseEase()

### Community 139 - "Community 139"
Cohesion: 0.29
Nodes (4): _createLookup(), _elementsFromElementStates(), FlipState, _handleCallback()

### Community 140 - "Community 140"
Cohesion: 0.35
Nodes (10): _buildGetter(), _clean(), _getGSAP(), _getOffset(), _initCore(), _isFunction(), _isString(), _max() (+2 more)

### Community 141 - "Community 141"
Cohesion: 0.25
Nodes (3): Anchor, _callback(), _getLength()

### Community 142 - "Community 142"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 143 - "Community 143"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 144 - "Community 144"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 145 - "Community 145"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, start, start:prod, typecheck (+1 more)

### Community 146 - "Community 146"
Cohesion: 0.29
Nodes (8): ImportsController, Controller, Post, Query, UseGuards, validateXlsxFile(), UploadedFile, UseInterceptors

### Community 147 - "Community 147"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, start, typecheck (+1 more)

### Community 148 - "Community 148"
Cohesion: 0.24
Nodes (7): MotionPathHelper(), PathEditor(), bezierToPoints(), getClosestData(), getClosestProgressOnBezier(), subdivideSegment(), subdivideSegmentNear()

### Community 149 - "Community 149"
Cohesion: 0.29
Nodes (6): arcToSegment(), CustomEase(), n(), q(), r(), stringToRawPath()

### Community 150 - "Community 150"
Cohesion: 0.44
Nodes (9): A(), k(), l(), m(), n(), o(), p(), u() (+1 more)

### Community 151 - "Community 151"
Cohesion: 0.36
Nodes (8): l(), m(), n(), p(), q(), s(), t(), u()

### Community 152 - "Community 152"
Cohesion: 0.20
Nodes (10): Db(), J(), nb(), oc(), qc(), Tb(), Ua(), Va() (+2 more)

### Community 153 - "Community 153"
Cohesion: 0.24
Nodes (3): _assertThisInitialized(), Timeline(), Tween()

### Community 154 - "Community 154"
Cohesion: 0.24
Nodes (6): name_match_key(), name_with_price_key(), normalize_name(), RS-Database-Updated.xlsx Generator Merges WS RATES.pdf data with catalogue-produ, Normalize product name for matching., Generate a matching key.

### Community 155 - "Community 155"
Cohesion: 0.22
Nodes (9): A(), B(), F(), G(), L(), P(), Q(), r() (+1 more)

### Community 156 - "Community 156"
Cohesion: 0.39
Nodes (5): _create(), CustomBounce, _getGSAP(), _initCore(), _normalizeX()

### Community 157 - "Community 157"
Cohesion: 0.33
Nodes (4): constructor(), kill(), revert(), split()

### Community 158 - "Community 158"
Cohesion: 0.28
Nodes (9): cacheRawPathMeasurements(), copyRawPath(), getPositionOnPath(), getProgressData(), getRotationAtBezierT(), measureSegment(), segmentToDistributedPoints(), sliceRawPath() (+1 more)

### Community 159 - "Community 159"
Cohesion: 0.22
Nodes (7): adapter, CANONICAL_PRICE_IDS_TO_REOPEN, NON_CANONICAL_BATCH_IDS, pool, prisma, SYNTHETIC_MAPPING_IDS, TEST_SUCCESSOR_PRICE_IDS

### Community 160 - "Community 160"
Cohesion: 0.25
Nodes (7): exclude, extends, node_modules, dist, **/*spec.ts, test, ./tsconfig.json

### Community 161 - "Community 161"
Cohesion: 0.32
Nodes (6): Action, ActionSearchBar(), allActionsSample, ANIMATION_VARIANTS, SearchResult, useDebounce()

### Community 162 - "Community 162"
Cohesion: 0.32
Nodes (8): aa(), ia(), reverseSegment(), U(), X(), Y(), Z(), $()

### Community 163 - "Community 163"
Cohesion: 0.29
Nodes (6): ExpenseItem, MOCK_EXPENSES, MOCK_REVENUE, MOCK_SALES_TREND_POINTS, RevenueItem, SalesTrendPoint

### Community 164 - "Community 164"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, tsConfigPath, $schema, sourceRoot

### Community 165 - "Community 165"
Cohesion: 0.38
Nodes (5): _createClass(), _defineProperties(), Observer(), TODO: potential idea: use legitimate CSS scroll snapping by pushing invisible el, ScrollTrigger()

### Community 166 - "Community 166"
Cohesion: 0.62
Nodes (4): CharSet(), emojiSafeSplit(), getText(), splitInnerHTML()

### Community 167 - "Community 167"
Cohesion: 0.48
Nodes (7): ba(), getGlobalMatrix(), S(), ua(), va(), Y(), $()

### Community 168 - "Community 168"
Cohesion: 0.33
Nodes (4): _getGSAP(), _initCore(), Physics2DPlugin, PhysicsProp

### Community 169 - "Community 169"
Cohesion: 0.33
Nodes (4): _getGSAP(), _initCore(), PhysicsProp, PhysicsPropsPlugin

### Community 170 - "Community 170"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, typecheck

### Community 171 - "Community 171"
Cohesion: 0.47
Nodes (5): getStepIndex(), OrderTrackingTimeline(), OrderTrackingTimelineProps, steps, OrderStatus

### Community 173 - "Community 173"
Cohesion: 0.47
Nodes (4): CharSet(), emojiSafeSplit(), i(), p()

### Community 174 - "Community 174"
Cohesion: 0.47
Nodes (4): s(), ScrollSmoother(), t(), v()

### Community 175 - "Community 175"
Cohesion: 0.53
Nodes (6): Eb(), Ma(), Na(), Oa(), Ra(), z()

### Community 176 - "Community 176"
Cohesion: 0.60
Nodes (5): _checkRegister(), CSSRulePlugin, _getGSAP(), _initCore(), _windowExists()

### Community 178 - "Community 178"
Cohesion: 0.47
Nodes (4): _assertThisInitialized(), Draggable(), Timeline(), Tween()

### Community 184 - "Community 184"
Cohesion: 0.40
Nodes (5): arcToSegment(), convertToPath(), getRawPath(), rawPathToString(), stringToRawPath()

### Community 186 - "Community 186"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 187 - "Community 187"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 188 - "Community 188"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 189 - "Community 189"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 190 - "Community 190"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 191 - "Community 191"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 192 - "Community 192"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 193 - "Community 193"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 194 - "Community 194"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 195 - "Community 195"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 196 - "Community 196"
Cohesion: 0.50
Nodes (4): adminToken, main(), testAuth(), userToken

### Community 198 - "Community 198"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 199 - "Community 199"
Cohesion: 0.50
Nodes (3): _initIfNecessary(), _initIfNecessary(), _initIfNecessary()

### Community 211 - "Community 211"
Cohesion: 0.67
Nodes (3): _arrayLikeToArray(), _createForOfIteratorHelperLoose(), _unsupportedIterableToArray()

### Community 212 - "Community 212"
Cohesion: 0.67
Nodes (3): CharSet(), emojiSafeSplit(), splitInnerHTML()

### Community 213 - "Community 213"
Cohesion: 0.67
Nodes (3): pointToSegDist(), simplifyPoints(), simplifyStep()

## Knowledge Gaps
- **744 isolated node(s):** `Card`, `CARDS`, `variants`, `reducedMotionVariants`, `NAV_ITEMS` (+739 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **66 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `Community 21` to `Backend NestJS Catalogue APIs`, `Community 48`, `Community 49`, `Community 146`, `Community 52`, `Community 88`, `Community 89`, `Community 58`, `Community 27`, `Community 28`, `Community 93`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `f()` connect `Community 51` to `Community 96`, `Community 135`, `Community 167`, `Community 109`, `Community 23`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Roles()` connect `Community 21` to `Community 91`, `Community 74`, `Backend NestJS Catalogue APIs`, `Community 48`, `Community 49`, `Community 146`, `Community 52`, `Community 53`, `Community 56`, `Community 27`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `Card`, `CARDS`, `variants` to the rest of the system?**
  _744 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GSAP Animation Core Library` be split into smaller, more focused modules?**
  _Cohesion score 0.04397222806648433 - nodes in this community are weakly interconnected._
- **Should `GSAP Plugins & Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.05311871227364185 - nodes in this community are weakly interconnected._
- **Should `GSAP Text & Layout Plugins` be split into smaller, more focused modules?**
  _Cohesion score 0.03836317135549872 - nodes in this community are weakly interconnected._