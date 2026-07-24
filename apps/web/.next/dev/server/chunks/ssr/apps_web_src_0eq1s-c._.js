module.exports = [
"[project]/apps/web/src/lib/gsap/src/Observer.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Observer",
    ()=>Observer,
    "_getProxyProp",
    ()=>_getProxyProp,
    "_getScrollFunc",
    ()=>_getScrollFunc,
    "_getTarget",
    ()=>_getTarget,
    "_getVelocityProp",
    ()=>_getVelocityProp,
    "_horizontal",
    ()=>_horizontal,
    "_isViewport",
    ()=>_isViewport,
    "_proxies",
    ()=>_proxies,
    "_scrollers",
    ()=>_scrollers,
    "_vertical",
    ()=>_vertical,
    "default",
    ()=>Observer
]);
/*!
 * Observer 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ let gsap, _coreInitted, _clamp, _win, _doc, _docEl, _body, _isTouch, _pointerType, ScrollTrigger, _root, _normalizer, _eventTypes, _context, _getGSAP = ()=>gsap || ("TURBOPACK compile-time value", "undefined") !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap, _startup = 1, _observers = [], _scrollers = [], _proxies = [], _getTime = Date.now, _bridge = (name, value)=>value, _integrate = ()=>{
    let core = ScrollTrigger.core, data = core.bridge || {}, scrollers = core._scrollers, proxies = core._proxies;
    scrollers.push(..._scrollers);
    proxies.push(..._proxies);
    _scrollers = scrollers;
    _proxies = proxies;
    _bridge = (name, value)=>data[name](value);
}, _getProxyProp = (element, property)=>~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property], _isViewport = (el)=>!!~_root.indexOf(el), _addListener = (element, type, func, passive, capture)=>element.addEventListener(type, func, {
        passive: passive !== false,
        capture: !!capture
    }), _removeListener = (element, type, func, capture)=>element.removeEventListener(type, func, !!capture), _scrollLeft = "scrollLeft", _scrollTop = "scrollTop", _onScroll = ()=>_normalizer && _normalizer.isPressed || _scrollers.cache++, _scrollCacheFunc = (f, doNotCache)=>{
    let cachingFunc = (value)=>{
        if (value || value === 0) {
            _startup && (_win.history.scrollRestoration = "manual"); // otherwise the new position will get overwritten by the browser onload.
            let isNormalizing = _normalizer && _normalizer.isPressed;
            value = cachingFunc.v = Math.round(value) || (_normalizer && _normalizer.iOS ? 1 : 0); //TODO: iOS Bug: if you allow it to go to 0, Safari can start to report super strange (wildly inaccurate) touch positions!
            f(value);
            cachingFunc.cacheID = _scrollers.cache;
            isNormalizing && _bridge("ss", value); // set scroll (notify ScrollTrigger so it can dispatch a "scrollStart" event if necessary
        } else if (doNotCache || _scrollers.cache !== cachingFunc.cacheID || _bridge("ref")) {
            cachingFunc.cacheID = _scrollers.cache;
            cachingFunc.v = f();
        }
        return cachingFunc.v + cachingFunc.offset;
    };
    cachingFunc.offset = 0;
    return f && cachingFunc;
}, _horizontal = {
    s: _scrollLeft,
    p: "left",
    p2: "Left",
    os: "right",
    os2: "Right",
    d: "width",
    d2: "Width",
    a: "x",
    sc: _scrollCacheFunc(function(value) {
        return arguments.length ? _win.scrollTo(value, _vertical.sc()) : _win.pageXOffset || _doc[_scrollLeft] || _docEl[_scrollLeft] || _body[_scrollLeft] || 0;
    })
}, _vertical = {
    s: _scrollTop,
    p: "top",
    p2: "Top",
    os: "bottom",
    os2: "Bottom",
    d: "height",
    d2: "Height",
    a: "y",
    op: _horizontal,
    sc: _scrollCacheFunc(function(value) {
        return arguments.length ? _win.scrollTo(_horizontal.sc(), value) : _win.pageYOffset || _doc[_scrollTop] || _docEl[_scrollTop] || _body[_scrollTop] || 0;
    })
}, _getTarget = (t, self)=>(self && self._ctx && self._ctx.selector || gsap.utils.toArray)(t)[0] || (typeof t === "string" && gsap.config().nullTargetWarn !== false ? console.warn("Element not found:", t) : null), _isWithin = (element, list)=>{
    let i = list.length;
    while(i--){
        if (list[i] === element || list[i].contains(element)) {
            return true;
        }
    }
    return false;
}, _getScrollFunc = (element, { s, sc })=>{
    _isViewport(element) && (element = _doc.scrollingElement || _docEl);
    let i = _scrollers.indexOf(element), offset = sc === _vertical.sc ? 1 : 2;
    !~i && (i = _scrollers.push(element) - 1);
    _scrollers[i + offset] || _addListener(element, "scroll", _onScroll); // clear the cache when a scroll occurs
    let prev = _scrollers[i + offset], func = prev || (_scrollers[i + offset] = _scrollCacheFunc(_getProxyProp(element, s), true) || (_isViewport(element) ? sc : _scrollCacheFunc(function(value) {
        return arguments.length ? element[s] = value : element[s];
    })));
    func.target = element;
    prev || (func.smooth = gsap.getProperty(element, "scrollBehavior") === "smooth"); // only set it the first time (don't reset every time a scrollFunc is requested because perhaps it happens during a refresh() when it's disabled in ScrollTrigger.
    return func;
}, _getVelocityProp = (value, minTimeRefresh, useDelta)=>{
    let v1 = value, v2 = value, t1 = _getTime(), t2 = t1, min = minTimeRefresh || 50, dropToZeroTime = Math.max(500, min * 3), update = (value, force)=>{
        let t = _getTime();
        if (force || t - t1 > min) {
            v2 = v1;
            v1 = value;
            t2 = t1;
            t1 = t;
        } else if (useDelta) {
            v1 += value;
        } else {
            v1 = v2 + (value - v2) / (t - t2) * (t1 - t2);
        }
    }, reset = ()=>{
        v2 = v1 = useDelta ? 0 : v1;
        t2 = t1 = 0;
    }, getVelocity = (latestValue)=>{
        let tOld = t2, vOld = v2, t = _getTime();
        (latestValue || latestValue === 0) && latestValue !== v1 && update(latestValue);
        return t1 === t2 || t - t2 > dropToZeroTime ? 0 : (v1 + (useDelta ? vOld : -vOld)) / ((useDelta ? t : t1) - tOld) * 1000;
    };
    return {
        update,
        reset,
        getVelocity
    };
}, _getEvent = (e, preventDefault)=>{
    preventDefault && !e._gsapAllow && e.cancelable !== false && e.preventDefault();
    return e.changedTouches ? e.changedTouches[0] : e;
}, _getAbsoluteMax = (a)=>{
    let max = Math.max(...a), min = Math.min(...a);
    return Math.abs(max) >= Math.abs(min) ? max : min;
}, _setScrollTrigger = ()=>{
    ScrollTrigger = gsap.core.globals().ScrollTrigger;
    ScrollTrigger && ScrollTrigger.core && _integrate();
}, _initCore = (core)=>{
    gsap = core || _getGSAP();
    if (!_coreInitted && gsap && typeof document !== "undefined" && document.body) {
        _win = window;
        _doc = document;
        _docEl = _doc.documentElement;
        _body = _doc.body;
        _root = [
            _win,
            _doc,
            _docEl,
            _body
        ];
        _clamp = gsap.utils.clamp;
        _context = gsap.core.context || function() {};
        _pointerType = "onpointerenter" in _body ? "pointer" : "mouse";
        // isTouch is 0 if no touch, 1 if ONLY touch, and 2 if it can accommodate touch but also other types like mouse/pointer.
        _isTouch = Observer.isTouch = _win.matchMedia && _win.matchMedia("(hover: none), (pointer: coarse)").matches ? 1 : "ontouchstart" in _win || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 ? 2 : 0;
        _eventTypes = Observer.eventTypes = ("ontouchstart" in _docEl ? "touchstart,touchmove,touchcancel,touchend" : !("onpointerdown" in _docEl) ? "mousedown,mousemove,mouseup,mouseup" : "pointerdown,pointermove,pointercancel,pointerup").split(",");
        setTimeout(()=>_startup = 0, 500);
        _coreInitted = 1;
    }
    ScrollTrigger || _setScrollTrigger(); // Observer might be initted BEFORE ScrollTrigger, so don't put this with the initting code. ScrollTrigger will call Observer.register() when it inits.
    return _coreInitted;
};
_horizontal.op = _vertical;
_scrollers.cache = 0;
class Observer {
    constructor(vars){
        this.init(vars);
    }
    init(vars) {
        _coreInitted || _initCore(gsap) || console.warn("Please gsap.registerPlugin(Observer)");
        ScrollTrigger || _setScrollTrigger();
        let { tolerance, dragMinimum, type, target, lineHeight, debounce, preventDefault, onStop, onStopDelay, ignore, wheelSpeed, event, onDragStart, onDragEnd, onDrag, onPress, onRelease, onRight, onLeft, onUp, onDown, onChangeX, onChangeY, onChange, onToggleX, onToggleY, onHover, onHoverEnd, onMove, ignoreCheck, isNormalizer, onGestureStart, onGestureEnd, onWheel, onEnable, onDisable, onClick, scrollSpeed, capture, allowClicks, lockAxis, onLockAxis } = vars;
        this.target = target = _getTarget(target) || _docEl;
        this.vars = vars;
        ignore && (ignore = gsap.utils.toArray(ignore));
        tolerance = tolerance || 1e-9;
        dragMinimum = dragMinimum || 0;
        wheelSpeed = wheelSpeed || 1;
        scrollSpeed = scrollSpeed || 1;
        type = type || "wheel,touch,pointer";
        debounce = debounce !== false;
        lineHeight || (lineHeight = parseFloat(_win.getComputedStyle(_body).lineHeight) || 22); // note: browser may report "normal", so default to 22.
        let id, onStopDelayedCall, dragged, moved, wheeled, locked, axis, self = this, prevDeltaX = 0, prevDeltaY = 0, passive = vars.passive || !preventDefault && vars.passive !== false, scrollFuncX = _getScrollFunc(target, _horizontal), scrollFuncY = _getScrollFunc(target, _vertical), scrollX = scrollFuncX(), scrollY = scrollFuncY(), limitToTouch = ~type.indexOf("touch") && !~type.indexOf("pointer") && _eventTypes[0] === "pointerdown", isViewport = _isViewport(target), ownerDoc = target.ownerDocument || _doc, deltaX = [
            0,
            0,
            0
        ], deltaY = [
            0,
            0,
            0
        ], onClickTime = 0, clickCapture = ()=>onClickTime = _getTime(), _ignoreCheck = (e, isPointerOrTouch)=>(self.event = e) && ignore && _isWithin(e.target, ignore) || isPointerOrTouch && limitToTouch && e.pointerType !== "touch" || ignoreCheck && ignoreCheck(e, isPointerOrTouch), onStopFunc = ()=>{
            self._vx.reset();
            self._vy.reset();
            onStopDelayedCall.pause();
            onStop && onStop(self);
        }, update = ()=>{
            let dx = self.deltaX = _getAbsoluteMax(deltaX), dy = self.deltaY = _getAbsoluteMax(deltaY), changedX = Math.abs(dx) >= tolerance, changedY = Math.abs(dy) >= tolerance;
            onChange && (changedX || changedY) && onChange(self, dx, dy, deltaX, deltaY); // in ScrollTrigger.normalizeScroll(), we need to know if it was touch/pointer so we need access to the deltaX/deltaY Arrays before we clear them out.
            if (changedX) {
                onRight && self.deltaX > 0 && onRight(self);
                onLeft && self.deltaX < 0 && onLeft(self);
                onChangeX && onChangeX(self);
                onToggleX && self.deltaX < 0 !== prevDeltaX < 0 && onToggleX(self);
                prevDeltaX = self.deltaX;
                deltaX[0] = deltaX[1] = deltaX[2] = 0;
            }
            if (changedY) {
                onDown && self.deltaY > 0 && onDown(self);
                onUp && self.deltaY < 0 && onUp(self);
                onChangeY && onChangeY(self);
                onToggleY && self.deltaY < 0 !== prevDeltaY < 0 && onToggleY(self);
                prevDeltaY = self.deltaY;
                deltaY[0] = deltaY[1] = deltaY[2] = 0;
            }
            if (moved || dragged) {
                onMove && onMove(self);
                if (dragged) {
                    onDragStart && dragged === 1 && onDragStart(self);
                    onDrag && onDrag(self);
                    dragged = 0;
                }
                moved = false;
            }
            locked && !(locked = false) && onLockAxis && onLockAxis(self);
            if (wheeled) {
                onWheel(self);
                wheeled = false;
            }
            id = 0;
        }, onDelta = (x, y, index)=>{
            deltaX[index] += x;
            deltaY[index] += y;
            self._vx.update(x);
            self._vy.update(y);
            debounce ? id || (id = requestAnimationFrame(update)) : update();
        }, onTouchOrPointerDelta = (x, y)=>{
            if (lockAxis && !axis) {
                self.axis = axis = Math.abs(x) > Math.abs(y) ? "x" : "y";
                locked = true;
            }
            if (axis !== "y") {
                deltaX[2] += x;
                self._vx.update(x, true); // update the velocity as frequently as possible instead of in the debounced function so that very quick touch-scrolls (flicks) feel natural. If it's the mouse/touch/pointer, force it so that we get snappy/accurate momentum scroll.
            }
            if (axis !== "x") {
                deltaY[2] += y;
                self._vy.update(y, true);
            }
            debounce ? id || (id = requestAnimationFrame(update)) : update();
        }, _onDrag = (e)=>{
            if (_ignoreCheck(e, 1)) {
                return;
            }
            e = _getEvent(e, preventDefault);
            let x = e.clientX, y = e.clientY, dx = x - self.x, dy = y - self.y, isDragging = self.isDragging;
            self.x = x;
            self.y = y;
            if (isDragging || (dx || dy) && (Math.abs(self.startX - x) >= dragMinimum || Math.abs(self.startY - y) >= dragMinimum)) {
                dragged || (dragged = isDragging ? 2 : 1); // dragged: 0 = not dragging, 1 = first drag, 2 = normal drag
                isDragging || (self.isDragging = true);
                onTouchOrPointerDelta(dx, dy);
            }
        }, _onPress = self.onPress = (e)=>{
            if (_ignoreCheck(e, 1) || e && e.button) {
                return;
            }
            self.axis = axis = null;
            onStopDelayedCall.pause();
            self.isPressed = true;
            e = _getEvent(e); // note: may need to preventDefault(?) Won't side-scroll on iOS Safari if we do, though.
            prevDeltaX = prevDeltaY = 0;
            self.startX = self.x = e.clientX;
            self.startY = self.y = e.clientY;
            self._vx.reset(); // otherwise the t2 may be stale if the user touches and flicks super fast and releases in less than 2 requestAnimationFrame ticks, causing velocity to be 0.
            self._vy.reset();
            _addListener(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, passive, true);
            self.deltaX = self.deltaY = 0;
            onPress && onPress(self);
        }, _onRelease = self.onRelease = (e)=>{
            if (_ignoreCheck(e, 1)) {
                return;
            }
            _removeListener(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, true);
            let isTrackingDrag = !isNaN(self.y - self.startY), wasDragging = self.isDragging, isDragNotClick = wasDragging && (Math.abs(self.x - self.startX) > 3 || Math.abs(self.y - self.startY) > 3), eventData = _getEvent(e);
            if (!isDragNotClick && isTrackingDrag) {
                self._vx.reset();
                self._vy.reset();
                //if (preventDefault && allowClicks && self.isPressed) { // check isPressed because in a rare edge case, the inputObserver in ScrollTrigger may stopPropagation() on the press/drag, so the onRelease may get fired without the onPress/onDrag ever getting called, thus it could trigger a click to occur on a link after scroll-dragging it.
                if (preventDefault && allowClicks) {
                    gsap.delayedCall(0.08, ()=>{
                        if (_getTime() - onClickTime > 300 && !e.defaultPrevented) {
                            if (e.target.click) {
                                e.target.click();
                            } else if (ownerDoc.createEvent) {
                                let syntheticEvent = ownerDoc.createEvent("MouseEvents");
                                syntheticEvent.initMouseEvent("click", true, true, _win, 1, eventData.screenX, eventData.screenY, eventData.clientX, eventData.clientY, false, false, false, false, 0, null);
                                e.target.dispatchEvent(syntheticEvent);
                            }
                        }
                    });
                }
            }
            self.isDragging = self.isGesturing = self.isPressed = false;
            onStop && wasDragging && !isNormalizer && onStopDelayedCall.restart(true);
            dragged && update(); // in case debouncing, we don't want onDrag to fire AFTER onDragEnd().
            onDragEnd && wasDragging && onDragEnd(self);
            onRelease && onRelease(self, isDragNotClick);
        }, _onGestureStart = (e)=>e.touches && e.touches.length > 1 && (self.isGesturing = true) && onGestureStart(e, self.isDragging), _onGestureEnd = ()=>(self.isGesturing = false) || onGestureEnd(self), onScroll = (e)=>{
            if (_ignoreCheck(e)) {
                return;
            }
            let x = scrollFuncX(), y = scrollFuncY();
            onDelta((x - scrollX) * scrollSpeed, (y - scrollY) * scrollSpeed, 1);
            scrollX = x;
            scrollY = y;
            onStop && onStopDelayedCall.restart(true);
        }, _onWheel = (e)=>{
            if (_ignoreCheck(e)) {
                return;
            }
            e = _getEvent(e, preventDefault);
            onWheel && (wheeled = true);
            let multiplier = (e.deltaMode === 1 ? lineHeight : e.deltaMode === 2 ? _win.innerHeight : 1) * wheelSpeed;
            onDelta(e.deltaX * multiplier, e.deltaY * multiplier, 0);
            onStop && !isNormalizer && onStopDelayedCall.restart(true);
        }, _onMove = (e)=>{
            if (_ignoreCheck(e)) {
                return;
            }
            let x = e.clientX, y = e.clientY, dx = x - self.x, dy = y - self.y;
            self.x = x;
            self.y = y;
            moved = true;
            onStop && onStopDelayedCall.restart(true);
            (dx || dy) && onTouchOrPointerDelta(dx, dy);
        }, _onHover = (e)=>{
            self.event = e;
            onHover(self);
        }, _onHoverEnd = (e)=>{
            self.event = e;
            onHoverEnd(self);
        }, _onClick = (e)=>_ignoreCheck(e) || _getEvent(e, preventDefault) && onClick(self);
        onStopDelayedCall = self._dc = gsap.delayedCall(onStopDelay || 0.25, onStopFunc).pause();
        self.deltaX = self.deltaY = 0;
        self._vx = _getVelocityProp(0, 50, true);
        self._vy = _getVelocityProp(0, 50, true);
        self.scrollX = scrollFuncX;
        self.scrollY = scrollFuncY;
        self.isDragging = self.isGesturing = self.isPressed = false;
        _context(this);
        self.enable = (e)=>{
            if (!self.isEnabled) {
                _addListener(isViewport ? ownerDoc : target, "scroll", _onScroll);
                type.indexOf("scroll") >= 0 && _addListener(isViewport ? ownerDoc : target, "scroll", onScroll, passive, capture);
                type.indexOf("wheel") >= 0 && _addListener(target, "wheel", _onWheel, passive, capture);
                if (type.indexOf("touch") >= 0 && _isTouch || type.indexOf("pointer") >= 0) {
                    _addListener(target, _eventTypes[0], _onPress, passive, capture);
                    _addListener(ownerDoc, _eventTypes[2], _onRelease);
                    _addListener(ownerDoc, _eventTypes[3], _onRelease);
                    allowClicks && _addListener(target, "click", clickCapture, true, true);
                    onClick && _addListener(target, "click", _onClick);
                    onGestureStart && _addListener(ownerDoc, "gesturestart", _onGestureStart);
                    onGestureEnd && _addListener(ownerDoc, "gestureend", _onGestureEnd);
                    onHover && _addListener(target, _pointerType + "enter", _onHover);
                    onHoverEnd && _addListener(target, _pointerType + "leave", _onHoverEnd);
                    onMove && _addListener(target, _pointerType + "move", _onMove);
                }
                self.isEnabled = true;
                self.isDragging = self.isGesturing = self.isPressed = moved = dragged = false;
                self._vx.reset();
                self._vy.reset();
                scrollX = scrollFuncX();
                scrollY = scrollFuncY();
                e && e.type && _onPress(e);
                onEnable && onEnable(self);
            }
            return self;
        };
        self.disable = ()=>{
            if (self.isEnabled) {
                // only remove the _onScroll listener if there aren't any others that rely on the functionality.
                _observers.filter((o)=>o !== self && _isViewport(o.target)).length || _removeListener(isViewport ? ownerDoc : target, "scroll", _onScroll);
                if (self.isPressed) {
                    self._vx.reset();
                    self._vy.reset();
                    _removeListener(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, true);
                }
                _removeListener(isViewport ? ownerDoc : target, "scroll", onScroll, capture);
                _removeListener(target, "wheel", _onWheel, capture);
                _removeListener(target, _eventTypes[0], _onPress, capture);
                _removeListener(ownerDoc, _eventTypes[2], _onRelease);
                _removeListener(ownerDoc, _eventTypes[3], _onRelease);
                _removeListener(target, "click", clickCapture, true);
                _removeListener(target, "click", _onClick);
                _removeListener(ownerDoc, "gesturestart", _onGestureStart);
                _removeListener(ownerDoc, "gestureend", _onGestureEnd);
                _removeListener(target, _pointerType + "enter", _onHover);
                _removeListener(target, _pointerType + "leave", _onHoverEnd);
                _removeListener(target, _pointerType + "move", _onMove);
                self.isEnabled = self.isPressed = self.isDragging = false;
                onDisable && onDisable(self);
            }
        };
        self.kill = self.revert = ()=>{
            self.disable();
            let i = _observers.indexOf(self);
            i >= 0 && _observers.splice(i, 1);
            _normalizer === self && (_normalizer = 0);
        };
        _observers.push(self);
        isNormalizer && _isViewport(target) && (_normalizer = self);
        self.enable(event);
    }
    get velocityX() {
        return this._vx.getVelocity();
    }
    get velocityY() {
        return this._vy.getVelocity();
    }
}
Observer.version = "3.15.0";
Observer.create = (vars)=>new Observer(vars);
Observer.register = _initCore;
Observer.getAll = ()=>_observers.slice();
Observer.getById = (id)=>_observers.filter((o)=>o.vars.id === id)[0];
_getGSAP() && gsap.registerPlugin(Observer);
;
}),
"[project]/apps/web/src/lib/gsap/src/ScrollTrigger.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollTrigger",
    ()=>ScrollTrigger,
    "default",
    ()=>ScrollTrigger
]);
/*!
 * ScrollTrigger 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/Observer.js [app-ssr] (ecmascript)");
;
let gsap, _coreInitted, _win, _doc, _docEl, _body, _root, _resizeDelay, _toArray, _clamp, _time2, _syncInterval, _refreshing, _pointerIsDown, _transformProp, _i, _prevWidth, _prevHeight, _autoRefresh, _sort, _suppressOverwrites, _ignoreResize, _normalizer, _ignoreMobileResize, _baseScreenHeight, _baseScreenWidth, _fixIOSBug, _context, _scrollRestoration, _div100vh, _100vh, _isReverted, _clampingMax, _limitCallbacks, _startup = 1, _getTime = Date.now, _time1 = _getTime(), _lastScrollTime = 0, _enabled = 0, _parseClamp = (value, type, self)=>{
    let clamp = _isString(value) && (value.substr(0, 6) === "clamp(" || value.indexOf("max") > -1);
    self["_" + type + "Clamp"] = clamp;
    return clamp ? value.substr(6, value.length - 7) : value;
}, _keepClamp = (value, clamp)=>clamp && (!_isString(value) || value.substr(0, 6) !== "clamp(") ? "clamp(" + value + ")" : value, _rafBugFix = ()=>_enabled && requestAnimationFrame(_rafBugFix), _pointerDownHandler = ()=>_pointerIsDown = 1, _pointerUpHandler = ()=>_pointerIsDown = 0, _passThrough = (v)=>v, _round = (value)=>Math.round(value * 100000) / 100000 || 0, _windowExists = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined", _getGSAP = ()=>gsap || _windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap, _isViewport = (e)=>!!~_root.indexOf(e), _getViewportDimension = (dimensionProperty)=>(dimensionProperty === "Height" ? _100vh : _win["inner" + dimensionProperty]) || _docEl["client" + dimensionProperty] || _body["client" + dimensionProperty], _getBoundsFunc = (element)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getProxyProp"])(element, "getBoundingClientRect") || (_isViewport(element) ? ()=>{
        _winOffsets.width = _win.innerWidth;
        _winOffsets.height = _100vh;
        return _winOffsets;
    } : ()=>_getBounds(element)), _getSizeFunc = (scroller, isViewport, { d, d2, a })=>(a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getProxyProp"])(scroller, "getBoundingClientRect")) ? ()=>a()[d] : ()=>(isViewport ? _getViewportDimension(d2) : scroller["client" + d2]) || 0, _getOffsetsFunc = (element, isViewport)=>!isViewport || ~__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_proxies"].indexOf(element) ? _getBoundsFunc(element) : ()=>_winOffsets, _maxScroll = (element, { s, d2, d, a })=>Math.max(0, (s = "scroll" + d2) && (a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getProxyProp"])(element, s)) ? a() - _getBoundsFunc(element)()[d] : _isViewport(element) ? (_docEl[s] || _body[s]) - _getViewportDimension(d2) : element[s] - element["offset" + d2]), _iterateAutoRefresh = (func, events)=>{
    for(let i = 0; i < _autoRefresh.length; i += 3){
        (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
    }
}, _isString = (value)=>typeof value === "string", _isFunction = (value)=>typeof value === "function", _isNumber = (value)=>typeof value === "number", _isObject = (value)=>typeof value === "object", _endAnimation = (animation, reversed, pause)=>animation && animation.progress(reversed ? 0 : 1) && pause && animation.pause(), _callback = (self, func, extraParam)=>{
    if (self.enabled) {
        let result = self._ctx ? self._ctx.add(()=>func(self, extraParam)) : func(self, extraParam);
        result && result.totalTime && (self.callbackAnimation = result);
    }
}, _abs = Math.abs, _left = "left", _top = "top", _right = "right", _bottom = "bottom", _width = "width", _height = "height", _Right = "Right", _Left = "Left", _Top = "Top", _Bottom = "Bottom", _padding = "padding", _margin = "margin", _Width = "Width", _Height = "Height", _px = "px", _getComputedStyle = (element)=>_win.getComputedStyle(element.nodeType === Node.DOCUMENT_NODE ? element.scrollingElement : element), _makePositionable = (element)=>{
    let position = _getComputedStyle(element).position;
    element.style.position = position === "absolute" || position === "fixed" ? position : "relative";
}, _setDefaults = (obj, defaults)=>{
    for(let p in defaults){
        p in obj || (obj[p] = defaults[p]);
    }
    return obj;
}, _getBounds = (element, withoutTransforms)=>{
    let tween = withoutTransforms && _getComputedStyle(element)[_transformProp] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap.to(element, {
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        skewX: 0,
        skewY: 0
    }).progress(1), bounds = element.getBoundingClientRect ? element.getBoundingClientRect() : element.scrollingElement.getBoundingClientRect();
    tween && tween.progress(0).kill();
    return bounds;
}, _getSize = (element, { d2 })=>element["offset" + d2] || element["client" + d2] || 0, _getLabelRatioArray = (timeline)=>{
    let a = [], labels = timeline.labels, duration = timeline.duration(), p;
    for(p in labels){
        a.push(labels[p] / duration);
    }
    return a;
}, _getClosestLabel = (animation)=>(value)=>gsap.utils.snap(_getLabelRatioArray(animation), value), _snapDirectional = (snapIncrementOrArray)=>{
    let snap = gsap.utils.snap(snapIncrementOrArray), a = Array.isArray(snapIncrementOrArray) && snapIncrementOrArray.slice(0).sort((a, b)=>a - b);
    return a ? (value, direction, threshold = 1e-3)=>{
        let i;
        if (!direction) {
            return snap(value);
        }
        if (direction > 0) {
            value -= threshold; // to avoid rounding errors. If we're too strict, it might snap forward, then immediately again, and again.
            for(i = 0; i < a.length; i++){
                if (a[i] >= value) {
                    return a[i];
                }
            }
            return a[i - 1];
        } else {
            i = a.length;
            value += threshold;
            while(i--){
                if (a[i] <= value) {
                    return a[i];
                }
            }
        }
        return a[0];
    } : (value, direction, threshold = 1e-3)=>{
        let snapped = snap(value);
        return !direction || Math.abs(snapped - value) < threshold || snapped - value < 0 === direction < 0 ? snapped : snap(direction < 0 ? value - snapIncrementOrArray : value + snapIncrementOrArray);
    };
}, _getLabelAtDirection = (timeline)=>(value, st)=>_snapDirectional(_getLabelRatioArray(timeline))(value, st.direction), _multiListener = (func, element, types, callback)=>types.split(",").forEach((type)=>func(element, type, callback)), _addListener = (element, type, func, nonPassive, capture)=>element.addEventListener(type, func, {
        passive: !nonPassive,
        capture: !!capture
    }), _removeListener = (element, type, func, capture)=>element.removeEventListener(type, func, !!capture), _wheelListener = (func, el, scrollFunc)=>{
    scrollFunc = scrollFunc && scrollFunc.wheelHandler;
    if (scrollFunc) {
        func(el, "wheel", scrollFunc);
        func(el, "touchmove", scrollFunc);
    }
}, _markerDefaults = {
    startColor: "green",
    endColor: "red",
    indent: 0,
    fontSize: "16px",
    fontWeight: "normal"
}, _defaults = {
    toggleActions: "play",
    anticipatePin: 0
}, _keywords = {
    top: 0,
    left: 0,
    center: 0.5,
    bottom: 1,
    right: 1
}, _offsetToPx = (value, size)=>{
    if (_isString(value)) {
        let eqIndex = value.indexOf("="), relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;
        if (~eqIndex) {
            value.indexOf("%") > eqIndex && (relative *= size / 100);
            value = value.substr(0, eqIndex - 1);
        }
        value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
    }
    return value;
}, _createMarker = (type, name, container, direction, { startColor, endColor, fontSize, indent, fontWeight }, offset, matchWidthEl, containerAnimation)=>{
    let e = _doc.createElement("div"), useFixedPosition = _isViewport(container) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getProxyProp"])(container, "pinType") === "fixed", isScroller = type.indexOf("scroller") !== -1, parent = useFixedPosition ? _body : container.tagName === "IFRAME" ? container.contentDocument.body : container, isStart = type.indexOf("start") !== -1, color = isStart ? startColor : endColor, css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
    css += "position:" + ((isScroller || containerAnimation) && useFixedPosition ? "fixed;" : "absolute;");
    (isScroller || containerAnimation || !useFixedPosition) && (css += (direction === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"] ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
    matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
    e._isStart = isStart;
    e.setAttribute("class", "gsap-marker-" + type + (name ? " marker-" + name : ""));
    e.style.cssText = css;
    e.innerText = name || name === 0 ? type + "-" + name : type;
    parent.children[0] ? parent.insertBefore(e, parent.children[0]) : parent.appendChild(e);
    e._offset = e["offset" + direction.op.d2];
    _positionMarker(e, 0, direction, isStart);
    return e;
}, _positionMarker = (marker, start, direction, flipped)=>{
    let vars = {
        display: "block"
    }, side = direction[flipped ? "os2" : "p2"], oppositeSide = direction[flipped ? "p2" : "os2"];
    marker._isFlipped = flipped;
    vars[direction.a + "Percent"] = flipped ? -100 : 0;
    vars[direction.a] = flipped ? "1px" : 0;
    vars["border" + side + _Width] = 1;
    vars["border" + oppositeSide + _Width] = 0;
    vars[direction.p] = start + "px";
    gsap.set(marker, vars);
}, _triggers = [], _ids = {}, _rafID, _sync = ()=>_getTime() - _lastScrollTime > 34 && (_rafID || (_rafID = requestAnimationFrame(_updateAll))), _onScroll = ()=>{
    if (!_normalizer || !_normalizer.isPressed || _normalizer.startX > _body.clientWidth) {
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].cache++;
        if (_normalizer) {
            _rafID || (_rafID = requestAnimationFrame(_updateAll));
        } else {
            _updateAll(); // Safari in particular (on desktop) NEEDS the immediate update rather than waiting for a requestAnimationFrame() whereas iOS seems to benefit from waiting for the requestAnimationFrame() tick, at least when normalizing. See https://codepen.io/GreenSock/pen/qBYozqO?editors=0110
        }
        _lastScrollTime || _dispatch("scrollStart");
        _lastScrollTime = _getTime();
    }
}, _setBaseDimensions = ()=>{
    _baseScreenWidth = _win.innerWidth;
    _baseScreenHeight = _win.innerHeight;
}, _onResize = (force)=>{
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].cache++;
    (force === true || !_refreshing && !_ignoreResize && !_doc.fullscreenElement && !_doc.webkitFullscreenElement && (!_ignoreMobileResize || _baseScreenWidth !== _win.innerWidth || Math.abs(_win.innerHeight - _baseScreenHeight) > _win.innerHeight * 0.25)) && _resizeDelay.restart(true);
}, _listeners = {}, _emptyArray = [], _softRefresh = ()=>_removeListener(ScrollTrigger, "scrollEnd", _softRefresh) || _refreshAll(true), _dispatch = (type)=>_listeners[type] && _listeners[type].map((f)=>f()) || _emptyArray, _savedStyles = [], _revertRecorded = (media)=>{
    for(let i = 0; i < _savedStyles.length; i += 5){
        if (!media || _savedStyles[i + 4] && _savedStyles[i + 4].query === media) {
            _savedStyles[i].style.cssText = _savedStyles[i + 1];
            _savedStyles[i].getBBox && _savedStyles[i].setAttribute("transform", _savedStyles[i + 2] || "");
            _savedStyles[i + 3].uncache = 1;
        }
    }
}, _recordScrollPositions = ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].forEach((obj)=>_isFunction(obj) && ++obj.cacheID && (obj.rec = obj())), _revertAll = (kill, media)=>{
    let trigger;
    for(_i = 0; _i < _triggers.length; _i++){
        trigger = _triggers[_i];
        if (trigger && (!media || trigger._ctx === media)) {
            if (kill) {
                trigger.kill(1);
            } else {
                trigger.revert(true, true);
            }
        }
    }
    _isReverted = true;
    media && _revertRecorded(media);
    media || _dispatch("revert");
}, _clearScrollMemory = (scrollRestoration, force)=>{
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].cache++;
    (force || !_refreshingAll) && __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].forEach((obj)=>_isFunction(obj) && obj.cacheID++ && (obj.rec = 0));
    _isString(scrollRestoration) && (_win.history.scrollRestoration = _scrollRestoration = scrollRestoration);
}, _refreshingAll, _refreshID = 0, _queueRefreshID, _queueRefreshAll = ()=>{
    if (_queueRefreshID !== _refreshID) {
        let id = _queueRefreshID = _refreshID;
        requestAnimationFrame(()=>id === _refreshID && _refreshAll(true));
    }
}, _refresh100vh = ()=>{
    _body.appendChild(_div100vh);
    _100vh = !_normalizer && _div100vh.offsetHeight || _win.innerHeight;
    _body.removeChild(_div100vh);
}, _hideAllMarkers = (hide)=>_toArray(".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end").forEach((el)=>el.style.display = hide ? "none" : "block"), _refreshAll = (force, skipRevert)=>{
    _docEl = _doc.documentElement; // some frameworks like Astro may cache the <body> and replace it during routing, so we'll just re-record the _docEl and _body for safety (otherwise, the markers may not get added properly).
    _body = _doc.body;
    _root = [
        _win,
        _doc,
        _docEl,
        _body
    ];
    if (_lastScrollTime && !force && !_isReverted) {
        _addListener(ScrollTrigger, "scrollEnd", _softRefresh);
        return;
    }
    _refresh100vh();
    _refreshingAll = ScrollTrigger.isRefreshing = true;
    _isReverted || _recordScrollPositions();
    let refreshInits = _dispatch("refreshInit");
    _sort && ScrollTrigger.sort();
    skipRevert || _revertAll();
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].forEach((obj)=>{
        if (_isFunction(obj)) {
            obj.smooth && (obj.target.style.scrollBehavior = "auto"); // smooth scrolling interferes
            obj(0);
        }
    });
    _triggers.slice(0).forEach((t)=>t.refresh()); // don't loop with _i because during a refresh() someone could call ScrollTrigger.update() which would iterate through _i resulting in a skip.
    _isReverted = false;
    _triggers.forEach((t)=>{
        if (t._subPinOffset && t.pin) {
            let prop = t.vars.horizontal ? "offsetWidth" : "offsetHeight", original = t.pin[prop];
            t.revert(true, 1);
            t.adjustPinSpacing(t.pin[prop] - original);
            t.refresh();
        }
    });
    _clampingMax = 1; // pinSpacing might be propping a page open, thus when we .setPositions() to clamp a ScrollTrigger's end we should leave the pinSpacing alone. That's what this flag is for.
    _hideAllMarkers(true);
    _triggers.forEach((t)=>{
        let max = _maxScroll(t.scroller, t._dir), endClamp = t.vars.end === "max" || t._endClamp && t.end > max, startClamp = t._startClamp && t.start >= max;
        (endClamp || startClamp) && t.setPositions(startClamp ? max - 1 : t.start, endClamp ? Math.max(startClamp ? max : t.start + 1, max) : t.end, true);
    });
    _hideAllMarkers(false);
    _clampingMax = 0;
    refreshInits.forEach((result)=>result && result.render && result.render(-1)); // if the onRefreshInit() returns an animation (typically a gsap.set()), revert it. This makes it easy to put things in a certain spot before refreshing for measurement purposes, and then put things back.
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].forEach((obj)=>{
        if (_isFunction(obj)) {
            obj.smooth && requestAnimationFrame(()=>obj.target.style.scrollBehavior = "smooth");
            obj.rec && obj(obj.rec);
        }
    });
    _clearScrollMemory(_scrollRestoration, 1);
    _resizeDelay.pause();
    _refreshID++;
    _refreshingAll = 2;
    _updateAll(2);
    _triggers.forEach((t)=>_isFunction(t.vars.onRefresh) && t.vars.onRefresh(t));
    _refreshingAll = ScrollTrigger.isRefreshing = false;
    _dispatch("refresh");
}, _lastScroll = 0, _direction = 1, _primary, _updateAll = (force)=>{
    if (force === 2 || !_refreshingAll && !_isReverted) {
        ScrollTrigger.isUpdating = true;
        _primary && _primary.update(0); // ScrollSmoother uses refreshPriority -9999 to become the primary that gets updated before all others because it affects the scroll position.
        let l = _triggers.length, time = _getTime(), recordVelocity = time - _time1 >= 50, scroll = l && _triggers[0].scroll();
        _direction = _lastScroll > scroll ? -1 : 1;
        _refreshingAll || (_lastScroll = scroll);
        if (recordVelocity) {
            if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
                _lastScrollTime = 0;
                _dispatch("scrollEnd");
            }
            _time2 = _time1;
            _time1 = time;
        }
        if (_direction < 0) {
            _i = l;
            while(_i-- > 0){
                _triggers[_i] && _triggers[_i].update(0, recordVelocity);
            }
            _direction = 1;
        } else {
            for(_i = 0; _i < l; _i++){
                _triggers[_i] && _triggers[_i].update(0, recordVelocity);
            }
        }
        ScrollTrigger.isUpdating = false;
    }
    _rafID = 0;
}, _propNamesToCopy = [
    _left,
    _top,
    _bottom,
    _right,
    _margin + _Bottom,
    _margin + _Right,
    _margin + _Top,
    _margin + _Left,
    "display",
    "flexShrink",
    "float",
    "zIndex",
    "gridColumnStart",
    "gridColumnEnd",
    "gridRowStart",
    "gridRowEnd",
    "gridArea",
    "justifySelf",
    "alignSelf",
    "placeSelf",
    "order"
], _stateProps = _propNamesToCopy.concat([
    _width,
    _height,
    "boxSizing",
    "max" + _Width,
    "max" + _Height,
    "position",
    _margin,
    _padding,
    _padding + _Top,
    _padding + _Right,
    _padding + _Bottom,
    _padding + _Left
]), _swapPinOut = (pin, spacer, state)=>{
    _setState(state);
    let cache = pin._gsap;
    if (cache.spacerIsNative) {
        _setState(cache.spacerState);
    } else if (pin._gsap.swappedIn) {
        let parent = spacer.parentNode;
        if (parent) {
            parent.insertBefore(pin, spacer);
            parent.removeChild(spacer);
        }
    }
    pin._gsap.swappedIn = false;
}, _swapPinIn = (pin, spacer, cs, spacerState)=>{
    if (!pin._gsap.swappedIn) {
        let i = _propNamesToCopy.length, spacerStyle = spacer.style, pinStyle = pin.style, p;
        while(i--){
            p = _propNamesToCopy[i];
            spacerStyle[p] = cs[p];
        }
        spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
        cs.display === "inline" && (spacerStyle.display = "inline-block");
        pinStyle[_bottom] = pinStyle[_right] = "auto";
        spacerStyle.flexBasis = cs.flexBasis || "auto";
        spacerStyle.overflow = "visible";
        spacerStyle.boxSizing = "border-box";
        spacerStyle[_width] = _getSize(pin, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"]) + _px;
        spacerStyle[_height] = _getSize(pin, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"]) + _px;
        spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";
        _setState(spacerState);
        pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
        pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
        pinStyle[_padding] = cs[_padding];
        if (pin.parentNode !== spacer) {
            pin.parentNode.insertBefore(spacer, pin);
            spacer.appendChild(pin);
        }
        pin._gsap.swappedIn = true;
    }
}, _capsExp = /([A-Z])/g, _setState = (state)=>{
    if (state) {
        let style = state.t.style, l = state.length, i = 0, p, value;
        (state.t._gsap || gsap.core.getCache(state.t)).uncache = 1; // otherwise transforms may be off
        for(; i < l; i += 2){
            value = state[i + 1];
            p = state[i];
            if (value) {
                style[p] = value;
            } else if (style[p]) {
                style.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
            }
        }
    }
}, _getState = (element)=>{
    let l = _stateProps.length, style = element.style, state = [], i = 0;
    for(; i < l; i++){
        state.push(_stateProps[i], style[_stateProps[i]]);
    }
    state.t = element;
    return state;
}, _copyState = (state, override, omitOffsets)=>{
    let result = [], l = state.length, i = omitOffsets ? 8 : 0, p;
    for(; i < l; i += 2){
        p = state[i];
        result.push(p, p in override ? override[p] : state[i + 1]);
    }
    result.t = state.t;
    return result;
}, _winOffsets = {
    left: 0,
    top: 0
}, // // potential future feature (?) Allow users to calculate where a trigger hits (scroll position) like getScrollPosition("#id", "top bottom")
// _getScrollPosition = (trigger, position, {scroller, containerAnimation, horizontal}) => {
// 	scroller = _getTarget(scroller || _win);
// 	let direction = horizontal ? _horizontal : _vertical,
// 		isViewport = _isViewport(scroller);
// 	_getSizeFunc(scroller, isViewport, direction);
// 	return _parsePosition(position, _getTarget(trigger), _getSizeFunc(scroller, isViewport, direction)(), direction, _getScrollFunc(scroller, direction)(), 0, 0, 0, _getOffsetsFunc(scroller, isViewport)(), isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0, 0, containerAnimation ? containerAnimation.duration() : _maxScroll(scroller), containerAnimation);
// },
_parsePosition = (value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self, scrollerBounds, borderWidth, useFixedPosition, scrollerMax, containerAnimation, clampZeroProp)=>{
    _isFunction(value) && (value = value(self));
    if (_isString(value) && value.substr(0, 3) === "max") {
        value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
    }
    let time = containerAnimation ? containerAnimation.time() : 0, p1, p2, element;
    containerAnimation && containerAnimation.seek(0);
    isNaN(value) || (value = +value); // convert a string number like "45" to an actual number
    if (!_isNumber(value)) {
        _isFunction(trigger) && (trigger = trigger(self));
        let offsets = (value || "0").split(" "), bounds, localOffset, globalOffset, display;
        element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(trigger, self) || _body;
        bounds = _getBounds(element) || {};
        if ((!bounds || !bounds.left && !bounds.top) && _getComputedStyle(element).display === "none") {
            display = element.style.display;
            element.style.display = "block";
            bounds = _getBounds(element);
            display ? element.style.display = display : element.style.removeProperty("display");
        }
        localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
        globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
        value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
        markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
        scrollerSize -= scrollerSize - globalOffset; // adjust for the marker
    } else {
        containerAnimation && (value = gsap.utils.mapRange(containerAnimation.scrollTrigger.start, containerAnimation.scrollTrigger.end, 0, scrollerMax, value));
        markerScroller && _positionMarker(markerScroller, scrollerSize, direction, true);
    }
    if (clampZeroProp) {
        self[clampZeroProp] = value || -0.001;
        value < 0 && (value = 0);
    }
    if (marker) {
        let position = value + scrollerSize, isStart = marker._isStart;
        p1 = "scroll" + direction.d2;
        _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(_body[p1], _docEl[p1]) : marker.parentNode[p1]) <= position + 1);
        if (useFixedPosition) {
            scrollerBounds = _getBounds(markerScroller);
            useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
        }
    }
    if (containerAnimation && element) {
        p1 = _getBounds(element);
        containerAnimation.seek(scrollerMax);
        p2 = _getBounds(element);
        containerAnimation._caScrollDist = p1[direction.p] - p2[direction.p];
        value = value / containerAnimation._caScrollDist * scrollerMax;
    }
    containerAnimation && containerAnimation.seek(time);
    return containerAnimation ? value : Math.round(value);
}, _prefixExp = /(webkit|moz|length|cssText|inset)/i, _reparent = (element, parent, top, left)=>{
    if (element.parentNode !== parent) {
        let style = element.style, p, cs;
        if (parent === _body) {
            element._stOrig = style.cssText; // record original inline styles so we can revert them later
            cs = _getComputedStyle(element);
            for(p in cs){
                if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
                    style[p] = cs[p];
                }
            }
            style.top = top;
            style.left = left;
        } else {
            style.cssText = element._stOrig;
        }
        gsap.core.getCache(element).uncache = 1;
        parent.appendChild(element);
    }
}, _interruptionTracker = (getValueFunc, initialValue, onInterrupt)=>{
    let last1 = initialValue, last2 = last1;
    return (value)=>{
        let current = Math.round(getValueFunc()); // round because in some [very uncommon] Windows environments, scroll can get reported with decimals even though it was set without.
        if (current !== last1 && current !== last2 && Math.abs(current - last1) > 3 && Math.abs(current - last2) > 3) {
            value = current;
            onInterrupt && onInterrupt();
        }
        last2 = last1;
        last1 = Math.round(value);
        return last1;
    };
}, _shiftMarker = (marker, direction, value)=>{
    let vars = {};
    vars[direction.p] = "+=" + value;
    gsap.set(marker, vars);
}, // _mergeAnimations = animations => {
// 	let tl = gsap.timeline({smoothChildTiming: true}).startTime(Math.min(...animations.map(a => a.globalTime(0))));
// 	animations.forEach(a => {let time = a.totalTime(); tl.add(a); a.totalTime(time); });
// 	tl.smoothChildTiming = false;
// 	return tl;
// },
// returns a function that can be used to tween the scroll position in the direction provided, and when doing so it'll add a .tween property to the FUNCTION itself, and remove it when the tween completes or gets killed. This gives us a way to have multiple ScrollTriggers use a central function for any given scroller and see if there's a scroll tween running (which would affect if/how things get updated)
_getTweenCreator = (scroller, direction)=>{
    let getScroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getScrollFunc"])(scroller, direction), prop = "_scroll" + direction.p2, getTween = (scrollTo, vars, initialValue, change1, change2)=>{
        let tween = getTween.tween, onComplete = vars.onComplete, modifiers = {};
        initialValue = initialValue || getScroll();
        let checkForInterruption = _interruptionTracker(getScroll, initialValue, ()=>{
            tween.kill();
            getTween.tween = 0;
        });
        change2 = change1 && change2 || 0; // if change1 is 0, we set that to the difference and ignore change2. Otherwise, there would be a compound effect.
        change1 = change1 || scrollTo - initialValue;
        tween && tween.kill();
        vars[prop] = scrollTo;
        vars.inherit = false;
        vars.modifiers = modifiers;
        modifiers[prop] = ()=>checkForInterruption(initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio);
        vars.onUpdate = ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].cache++;
            getTween.tween && _updateAll(); // if it was interrupted/killed, like in a context.revert(), don't force an updateAll()
        };
        vars.onComplete = ()=>{
            getTween.tween = 0;
            onComplete && onComplete.call(tween);
        };
        tween = getTween.tween = gsap.to(scroller, vars);
        return tween;
    };
    scroller[prop] = getScroll;
    getScroll.wheelHandler = ()=>getTween.tween && getTween.tween.kill() && (getTween.tween = 0);
    _addListener(scroller, "wheel", getScroll.wheelHandler); // Windows machines handle mousewheel scrolling in chunks (like "3 lines per scroll") meaning the typical strategy for cancelling the scroll isn't as sensitive. It's much more likely to match one of the previous 2 scroll event positions. So we kill any snapping as soon as there's a wheel event.
    ScrollTrigger.isTouch && _addListener(scroller, "touchmove", getScroll.wheelHandler);
    return getTween;
};
class ScrollTrigger {
    constructor(vars, animation){
        _coreInitted || ScrollTrigger.register(gsap) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
        _context(this);
        this.init(vars, animation);
    }
    init(vars, animation) {
        this.progress = this.start = 0;
        this.vars && this.kill(true, true); // in case it's being initted again
        if (!_enabled) {
            this.update = this.refresh = this.kill = _passThrough;
            return;
        }
        vars = _setDefaults(_isString(vars) || _isNumber(vars) || vars.nodeType ? {
            trigger: vars
        } : vars, _defaults);
        let { onUpdate, toggleClass, id, onToggle, onRefresh, scrub, trigger, pin, pinSpacing, invalidateOnRefresh, anticipatePin, onScrubComplete, onSnapComplete, once, snap, pinReparent, pinSpacer, containerAnimation, fastScrollEnd, preventOverlaps } = vars, direction = vars.horizontal || vars.containerAnimation && vars.horizontal !== false ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"], isToggle = !scrub && scrub !== 0, scroller = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(vars.scroller || _win), scrollerCache = gsap.core.getCache(scroller), isViewport = _isViewport(scroller), useFixedPosition = ("pinType" in vars ? vars.pinType : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getProxyProp"])(scroller, "pinType") || isViewport && "fixed") === "fixed", callbacks = [
            vars.onEnter,
            vars.onLeave,
            vars.onEnterBack,
            vars.onLeaveBack
        ], toggleActions = isToggle && vars.toggleActions.split(" "), markers = "markers" in vars ? vars.markers : _defaults.markers, borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0, self = this, onRefreshInit = vars.onRefreshInit && (()=>vars.onRefreshInit(self)), getScrollerSize = _getSizeFunc(scroller, isViewport, direction), getScrollerOffsets = _getOffsetsFunc(scroller, isViewport), lastSnap = 0, lastRefresh = 0, prevProgress = 0, scrollFunc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getScrollFunc"])(scroller, direction), tweenTo, pinCache, snapFunc, scroll1, scroll2, start, end, markerStart, markerEnd, markerStartTrigger, markerEndTrigger, markerVars, executingOnRefresh, change, pinOriginalState, pinActiveState, pinState, spacer, offset, pinGetter, pinSetter, pinStart, pinChange, spacingStart, spacerState, markerStartSetter, pinMoves, markerEndSetter, cs, snap1, snap2, scrubTween, scrubSmooth, snapDurClamp, snapDelayedCall, prevScroll, prevAnimProgress, caMarkerSetter, customRevertReturn;
        // for the sake of efficiency, _startClamp/_endClamp serve like a truthy value indicating that clamping was enabled on the start/end, and ALSO store the actual pre-clamped numeric value. We tap into that in ScrollSmoother for speed effects. So for example, if start="clamp(top bottom)" results in a start of -100 naturally, it would get clamped to 0 but -100 would be stored in _startClamp.
        self._startClamp = self._endClamp = false;
        self._dir = direction;
        anticipatePin *= 45;
        self.scroller = scroller;
        self.scroll = containerAnimation ? containerAnimation.time.bind(containerAnimation) : scrollFunc;
        scroll1 = scrollFunc();
        self.vars = vars;
        animation = animation || vars.animation;
        if ("refreshPriority" in vars) {
            _sort = 1;
            vars.refreshPriority === -9999 && (_primary = self); // used by ScrollSmoother
        }
        scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
            top: _getTweenCreator(scroller, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"]),
            left: _getTweenCreator(scroller, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"])
        };
        self.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];
        self.scrubDuration = (value)=>{
            scrubSmooth = _isNumber(value) && value;
            if (!scrubSmooth) {
                scrubTween && scrubTween.progress(1).kill();
                scrubTween = 0;
            } else {
                scrubTween ? scrubTween.duration(value) : scrubTween = gsap.to(animation, {
                    ease: "expo",
                    totalProgress: "+=0",
                    inherit: false,
                    duration: scrubSmooth,
                    paused: true,
                    onComplete: ()=>onScrubComplete && onScrubComplete(self)
                });
            }
        };
        if (animation) {
            animation.vars.lazy = false;
            animation._initted && !self.isReverted || animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.duration() && animation.render(0, true, true); // special case: if this ScrollTrigger gets re-initted, a from() tween with a stagger could get initted initially and then reverted on the re-init which means it'll need to get rendered again here to properly display things. Otherwise, See https://gsap.com/forums/topic/36777-scrollsmoother-splittext-nextjs/ and https://codepen.io/GreenSock/pen/eYPyPpd?editors=0010
            self.animation = animation.pause();
            animation.scrollTrigger = self;
            self.scrubDuration(scrub);
            snap1 = 0;
            id || (id = animation.vars.id);
        }
        if (snap) {
            // TODO: potential idea: use legitimate CSS scroll snapping by pushing invisible elements into the DOM that serve as snap positions, and toggle the document.scrollingElement.style.scrollSnapType onToggle. See https://codepen.io/GreenSock/pen/JjLrgWM for a quick proof of concept.
            if (!_isObject(snap) || snap.push) {
                snap = {
                    snapTo: snap
                };
            }
            "scrollBehavior" in _body.style && gsap.set(isViewport ? [
                _body,
                _docEl
            ] : scroller, {
                scrollBehavior: "auto"
            }); // smooth scrolling doesn't work with snap.
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].forEach((o)=>_isFunction(o) && o.target === (isViewport ? _doc.scrollingElement || _docEl : scroller) && (o.smooth = false)); // note: set smooth to false on both the vertical and horizontal scroll getters/setters
            snapFunc = _isFunction(snap.snapTo) ? snap.snapTo : snap.snapTo === "labels" ? _getClosestLabel(animation) : snap.snapTo === "labelsDirectional" ? _getLabelAtDirection(animation) : snap.directional !== false ? (value, st)=>_snapDirectional(snap.snapTo)(value, _getTime() - lastRefresh < 500 ? 0 : st.direction) : gsap.utils.snap(snap.snapTo);
            snapDurClamp = snap.duration || {
                min: 0.1,
                max: 2
            };
            snapDurClamp = _isObject(snapDurClamp) ? _clamp(snapDurClamp.min, snapDurClamp.max) : _clamp(snapDurClamp, snapDurClamp);
            snapDelayedCall = gsap.delayedCall(snap.delay || scrubSmooth / 2 || 0.1, ()=>{
                let scroll = scrollFunc(), refreshedRecently = _getTime() - lastRefresh < 500, tween = tweenTo.tween;
                if ((refreshedRecently || Math.abs(self.getVelocity()) < 10) && !tween && !_pointerIsDown && lastSnap !== scroll) {
                    let progress = (scroll - start) / change, totalProgress = animation && !isToggle ? animation.totalProgress() : progress, velocity = refreshedRecently ? 0 : (totalProgress - snap2) / (_getTime() - _time2) * 1000 || 0, change1 = gsap.utils.clamp(-progress, 1 - progress, _abs(velocity / 2) * velocity / 0.185), naturalEnd = progress + (snap.inertia === false ? 0 : change1), endValue, endScroll, { onStart, onInterrupt, onComplete } = snap;
                    endValue = snapFunc(naturalEnd, self);
                    _isNumber(endValue) || (endValue = naturalEnd); // in case the function didn't return a number, fall back to using the naturalEnd
                    endScroll = Math.max(0, Math.round(start + endValue * change));
                    if (scroll <= end && scroll >= start && endScroll !== scroll) {
                        if (tween && !tween._initted && tween.data <= _abs(endScroll - scroll)) {
                            return;
                        }
                        if (snap.inertia === false) {
                            change1 = endValue - progress;
                        }
                        tweenTo(endScroll, {
                            duration: snapDurClamp(_abs(Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05 || 0)),
                            ease: snap.ease || "power3",
                            data: _abs(endScroll - scroll),
                            onInterrupt: ()=>snapDelayedCall.restart(true) && onInterrupt && _callback(self, onInterrupt),
                            onComplete () {
                                self.update();
                                lastSnap = scrollFunc();
                                if (animation && !isToggle) {
                                    scrubTween ? scrubTween.resetTo("totalProgress", endValue, animation._tTime / animation._tDur) : animation.progress(endValue);
                                }
                                snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self.progress;
                                onSnapComplete && onSnapComplete(self);
                                onComplete && _callback(self, onComplete);
                            }
                        }, scroll, change1 * change, endScroll - scroll - change1 * change);
                        onStart && _callback(self, onStart, tweenTo.tween);
                    }
                } else if (self.isActive && lastSnap !== scroll) {
                    snapDelayedCall.restart(true);
                }
            }).pause();
        }
        id && (_ids[id] = self);
        trigger = self.trigger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(trigger || pin !== true && pin);
        // if a trigger has some kind of scroll-related effect applied that could contaminate the "y" or "x" position (like a ScrollSmoother effect), we needed a way to temporarily revert it, so we use the stRevert property of the gsCache. It can return another function that we'll call at the end so it can return to its normal state.
        customRevertReturn = trigger && trigger._gsap && trigger._gsap.stRevert;
        customRevertReturn && (customRevertReturn = customRevertReturn(self));
        pin = pin === true ? trigger : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(pin);
        _isString(toggleClass) && (toggleClass = {
            targets: trigger,
            className: toggleClass
        });
        if (pin) {
            pinSpacing === false || pinSpacing === _margin || (pinSpacing = !pinSpacing && pin.parentNode && pin.parentNode.style && _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding); // if the parent is display: flex, don't apply pinSpacing by default. We should check that pin.parentNode is an element (not shadow dom window)
            self.pin = pin;
            pinCache = gsap.core.getCache(pin);
            if (!pinCache.spacer) {
                if (pinSpacer) {
                    pinSpacer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(pinSpacer);
                    pinSpacer && !pinSpacer.nodeType && (pinSpacer = pinSpacer.current || pinSpacer.nativeElement); // for React & Angular
                    pinCache.spacerIsNative = !!pinSpacer;
                    pinSpacer && (pinCache.spacerState = _getState(pinSpacer));
                }
                pinCache.spacer = spacer = pinSpacer || _doc.createElement("div");
                spacer.classList.add("pin-spacer");
                id && spacer.classList.add("pin-spacer-" + id);
                pinCache.pinState = pinOriginalState = _getState(pin);
            } else {
                pinOriginalState = pinCache.pinState;
            }
            vars.force3D !== false && gsap.set(pin, {
                force3D: true
            });
            self.spacer = spacer = pinCache.spacer;
            cs = _getComputedStyle(pin);
            spacingStart = cs[pinSpacing + direction.os2];
            pinGetter = gsap.getProperty(pin);
            pinSetter = gsap.quickSetter(pin, direction.a, _px);
            // pin.firstChild && !_maxScroll(pin, direction) && (pin.style.overflow = "hidden"); // protects from collapsing margins, but can have unintended consequences as demonstrated here: https://codepen.io/GreenSock/pen/1e42c7a73bfa409d2cf1e184e7a4248d so it was removed in favor of just telling people to set up their CSS to avoid the collapsing margins (overflow: hidden | auto is just one option. Another is border-top: 1px solid transparent).
            _swapPinIn(pin, spacer, cs);
            pinState = _getState(pin);
        }
        if (markers) {
            markerVars = _isObject(markers) ? _setDefaults(markers, _markerDefaults) : _markerDefaults;
            markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
            markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
            offset = markerStartTrigger["offset" + direction.op.d2];
            let content = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getProxyProp"])(scroller, "content") || scroller);
            markerStart = this.markerStart = _createMarker("start", id, content, direction, markerVars, offset, 0, containerAnimation);
            markerEnd = this.markerEnd = _createMarker("end", id, content, direction, markerVars, offset, 0, containerAnimation);
            containerAnimation && (caMarkerSetter = gsap.quickSetter([
                markerStart,
                markerEnd
            ], direction.a, _px));
            if (!useFixedPosition && !(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_proxies"].length && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getProxyProp"])(scroller, "fixedMarkers") === true)) {
                _makePositionable(isViewport ? _body : scroller);
                gsap.set([
                    markerStartTrigger,
                    markerEndTrigger
                ], {
                    force3D: true
                });
                markerStartSetter = gsap.quickSetter(markerStartTrigger, direction.a, _px);
                markerEndSetter = gsap.quickSetter(markerEndTrigger, direction.a, _px);
            }
        }
        if (containerAnimation) {
            let oldOnUpdate = containerAnimation.vars.onUpdate, oldParams = containerAnimation.vars.onUpdateParams;
            containerAnimation.eventCallback("onUpdate", ()=>{
                self.update(0, 0, 1);
                oldOnUpdate && oldOnUpdate.apply(containerAnimation, oldParams || []);
            });
        }
        self.previous = ()=>_triggers[_triggers.indexOf(self) - 1];
        self.next = ()=>_triggers[_triggers.indexOf(self) + 1];
        self.revert = (revert, temp)=>{
            if (!temp) {
                return self.kill(true);
            } // for compatibility with gsap.context() and gsap.matchMedia() which call revert()
            let r = revert !== false || !self.enabled, prevRefreshing = _refreshing;
            if (r !== self.isReverted) {
                if (r) {
                    prevScroll = Math.max(scrollFunc(), self.scroll.rec || 0); // record the scroll so we can revert later (repositioning/pinning things can affect scroll position). In the static refresh() method, we first record all the scroll positions as a reference.
                    prevProgress = self.progress;
                    prevAnimProgress = animation && animation.progress();
                }
                markerStart && [
                    markerStart,
                    markerEnd,
                    markerStartTrigger,
                    markerEndTrigger
                ].forEach((m)=>m.style.display = r ? "none" : "block");
                if (r) {
                    _refreshing = self;
                    self.update(r); // make sure the pin is back in its original position so that all the measurements are correct. do this BEFORE swapping the pin out
                }
                if (pin && (!pinReparent || !self.isActive)) {
                    if (r) {
                        _swapPinOut(pin, spacer, pinOriginalState);
                    } else {
                        _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState);
                    }
                }
                r || self.update(r); // when we're restoring, the update should run AFTER swapping the pin into its pin-spacer.
                _refreshing = prevRefreshing; // restore. We set it to true during the update() so that things fire properly in there.
                self.isReverted = r;
            }
        };
        self.refresh = (soft, force, position, pinOffset)=>{
            if ((_refreshing || !self.enabled) && !force) {
                return;
            }
            if (pin && soft && _lastScrollTime) {
                _addListener(ScrollTrigger, "scrollEnd", _softRefresh);
                return;
            }
            !_refreshingAll && onRefreshInit && onRefreshInit(self);
            _refreshing = self;
            if (tweenTo.tween && !position) {
                tweenTo.tween.kill();
                tweenTo.tween = 0;
            }
            scrubTween && scrubTween.pause();
            if (invalidateOnRefresh && animation) {
                animation.revert({
                    kill: false
                }).invalidate();
                animation.getChildren ? animation.getChildren(true, true, false).forEach((t)=>t.vars.immediateRender && t.render(0, true, true)) : animation.vars.immediateRender && animation.render(0, true, true); // any from() or fromTo() tweens should render immediately (well, unless they have immediateRender: false)
            }
            self.isReverted || self.revert(true, true);
            self._subPinOffset = false; // we'll set this to true in the sub-pins if we find any
            let size = getScrollerSize(), scrollerBounds = getScrollerOffsets(), max = containerAnimation ? containerAnimation.duration() : _maxScroll(scroller, direction), isFirstRefresh = change <= 0.01 || !change, offset = 0, otherPinOffset = pinOffset || 0, parsedEnd = _isObject(position) ? position.end : vars.end, parsedEndTrigger = vars.endTrigger || trigger, parsedStart = _isObject(position) ? position.start : vars.start || (vars.start === 0 || !trigger ? 0 : pin ? "0 0" : "0 100%"), pinnedContainer = self.pinnedContainer = vars.pinnedContainer && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(vars.pinnedContainer, self), triggerIndex = trigger && Math.max(0, _triggers.indexOf(self)) || 0, i = triggerIndex, cs, bounds, scroll, isVertical, override, curTrigger, curPin, oppositeScroll, initted, revertedPins, forcedOverflow, markerStartOffset, markerEndOffset;
            if (markers && _isObject(position)) {
                markerStartOffset = gsap.getProperty(markerStartTrigger, direction.p);
                markerEndOffset = gsap.getProperty(markerEndTrigger, direction.p);
            }
            while(i-- > 0){
                curTrigger = _triggers[i];
                curTrigger.end || curTrigger.refresh(0, 1) || (_refreshing = self); // if it's a timeline-based trigger that hasn't been fully initialized yet because it's waiting for 1 tick, just force the refresh() here, otherwise if it contains a pin that's supposed to affect other ScrollTriggers further down the page, they won't be adjusted properly.
                curPin = curTrigger.pin;
                if (curPin && (curPin === trigger || curPin === pin || curPin === pinnedContainer) && !curTrigger.isReverted) {
                    revertedPins || (revertedPins = []);
                    revertedPins.unshift(curTrigger); // we'll revert from first to last to make sure things reach their end state properly
                    curTrigger.revert(true, true);
                }
                if (curTrigger !== _triggers[i]) {
                    triggerIndex--;
                    i--;
                }
            }
            _isFunction(parsedStart) && (parsedStart = parsedStart(self));
            parsedStart = _parseClamp(parsedStart, "start", self);
            start = _parsePosition(parsedStart, trigger, size, direction, scrollFunc(), markerStart, markerStartTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation, self._startClamp && "_startClamp") || (pin ? -0.001 : 0);
            _isFunction(parsedEnd) && (parsedEnd = parsedEnd(self));
            if (_isString(parsedEnd) && !parsedEnd.indexOf("+=")) {
                if (~parsedEnd.indexOf(" ")) {
                    parsedEnd = (_isString(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
                } else {
                    offset = _offsetToPx(parsedEnd.substr(2), size);
                    parsedEnd = _isString(parsedStart) ? parsedStart : (containerAnimation ? gsap.utils.mapRange(0, containerAnimation.duration(), containerAnimation.scrollTrigger.start, containerAnimation.scrollTrigger.end, start) : start) + offset; // _parsePosition won't factor in the offset if the start is a number, so do it here.
                    parsedEndTrigger = trigger;
                }
            }
            parsedEnd = _parseClamp(parsedEnd, "end", self);
            end = Math.max(start, _parsePosition(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, scrollFunc() + offset, markerEnd, markerEndTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation, self._endClamp && "_endClamp")) || -0.001;
            offset = 0;
            i = triggerIndex;
            while(i--){
                curTrigger = _triggers[i] || {};
                curPin = curTrigger.pin;
                if (curPin && curTrigger.start - curTrigger._pinPush <= start && !containerAnimation && curTrigger.end > 0) {
                    cs = curTrigger.end - (self._startClamp ? Math.max(0, curTrigger.start) : curTrigger.start);
                    if ((curPin === trigger && curTrigger.start - curTrigger._pinPush < start || curPin === pinnedContainer) && isNaN(parsedStart)) {
                        offset += cs * (1 - curTrigger.progress);
                    }
                    curPin === pin && (otherPinOffset += cs);
                }
            }
            start += offset;
            end += offset;
            self._startClamp && (self._startClamp += offset);
            if (self._endClamp && !_refreshingAll) {
                self._endClamp = end || -0.001;
                end = Math.min(end, _maxScroll(scroller, direction));
            }
            change = end - start || (start -= 0.01) && 0.001;
            if (isFirstRefresh) {
                prevProgress = gsap.utils.clamp(0, 1, gsap.utils.normalize(start, end, prevScroll));
            }
            self._pinPush = otherPinOffset;
            if (markerStart && offset) {
                cs = {};
                cs[direction.a] = "+=" + offset;
                pinnedContainer && (cs[direction.p] = "-=" + scrollFunc());
                gsap.set([
                    markerStart,
                    markerEnd
                ], cs);
            }
            if (pin && !(_clampingMax && self.end >= _maxScroll(scroller, direction))) {
                cs = _getComputedStyle(pin);
                isVertical = direction === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"];
                scroll = scrollFunc(); // recalculate because the triggers can affect the scroll
                pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
                if (!max && end > 1) {
                    forcedOverflow = (isViewport ? _doc.scrollingElement || _docEl : scroller).style;
                    forcedOverflow = {
                        style: forcedOverflow,
                        value: forcedOverflow["overflow" + direction.a.toUpperCase()]
                    };
                    if (isViewport && _getComputedStyle(_body)["overflow" + direction.a.toUpperCase()] !== "scroll") {
                        forcedOverflow.style["overflow" + direction.a.toUpperCase()] = "scroll";
                    }
                }
                _swapPinIn(pin, spacer, cs);
                pinState = _getState(pin);
                // transforms will interfere with the top/left/right/bottom placement, so remove them temporarily. getBoundingClientRect() factors in transforms.
                bounds = _getBounds(pin, true);
                oppositeScroll = useFixedPosition && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getScrollFunc"])(scroller, isVertical ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"])();
                if (pinSpacing) {
                    spacerState = [
                        pinSpacing + direction.os2,
                        change + otherPinOffset + _px
                    ];
                    spacerState.t = spacer;
                    i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
                    if (i) {
                        spacerState.push(direction.d, i + _px); // for box-sizing: border-box (must include padding).
                        spacer.style.flexBasis !== "auto" && (spacer.style.flexBasis = i + _px);
                    }
                    _setState(spacerState);
                    if (pinnedContainer) {
                        _triggers.forEach((t)=>{
                            if (t.pin === pinnedContainer && t.vars.pinSpacing !== false) {
                                t._subPinOffset = true;
                            }
                        });
                    }
                    useFixedPosition && scrollFunc(prevScroll);
                } else {
                    i = _getSize(pin, direction);
                    i && spacer.style.flexBasis !== "auto" && (spacer.style.flexBasis = i + _px);
                }
                if (useFixedPosition) {
                    override = {
                        top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
                        left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
                        boxSizing: "border-box",
                        position: "fixed"
                    };
                    override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
                    override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
                    override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
                    override[_padding] = cs[_padding];
                    override[_padding + _Top] = cs[_padding + _Top];
                    override[_padding + _Right] = cs[_padding + _Right];
                    override[_padding + _Bottom] = cs[_padding + _Bottom];
                    override[_padding + _Left] = cs[_padding + _Left];
                    pinActiveState = _copyState(pinOriginalState, override, pinReparent);
                    _refreshingAll && scrollFunc(0);
                }
                if (animation) {
                    initted = animation._initted; // if not, we must invalidate() after this step, otherwise it could lock in starting values prematurely.
                    _suppressOverwrites(1);
                    animation.render(animation.duration(), true, true);
                    pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
                    pinMoves = Math.abs(change - pinChange) > 1;
                    useFixedPosition && pinMoves && pinActiveState.splice(pinActiveState.length - 2, 2); // transform is the last property/value set in the state Array. Since the animation is controlling that, we should omit it.
                    animation.render(0, true, true);
                    initted || animation.invalidate(true);
                    animation.parent || animation.totalTime(animation.totalTime()); // if, for example, a toggleAction called play() and then refresh() happens and when we render(1) above, it would cause the animation to complete and get removed from its parent, so this makes sure it gets put back in.
                    _suppressOverwrites(0);
                } else {
                    pinChange = change;
                }
                forcedOverflow && (forcedOverflow.value ? forcedOverflow.style["overflow" + direction.a.toUpperCase()] = forcedOverflow.value : forcedOverflow.style.removeProperty("overflow-" + direction.a));
            } else if (trigger && scrollFunc() && !containerAnimation) {
                bounds = trigger.parentNode;
                while(bounds && bounds !== _body){
                    if (bounds._pinOffset) {
                        start -= bounds._pinOffset;
                        end -= bounds._pinOffset;
                    }
                    bounds = bounds.parentNode;
                }
            }
            revertedPins && revertedPins.forEach((t)=>t.revert(false, true));
            self.start = start;
            self.end = end;
            scroll1 = scroll2 = _refreshingAll ? prevScroll : scrollFunc(); // reset velocity
            if (!containerAnimation && !_refreshingAll) {
                scroll1 < prevScroll && scrollFunc(prevScroll);
                self.scroll.rec = 0;
            }
            self.revert(false, true);
            lastRefresh = _getTime();
            if (snapDelayedCall) {
                lastSnap = -1; // just so snapping gets re-enabled, clear out any recorded last value
                // self.isActive && scrollFunc(start + change * prevProgress); // previously this line was here to ensure that when snapping kicks in, it's from the previous progress but in some cases that's not desirable, like an all-page ScrollTrigger when new content gets added to the page, that'd totally change the progress.
                snapDelayedCall.restart(true);
            }
            _refreshing = 0;
            animation && isToggle && (animation._initted || prevAnimProgress) && animation.progress() !== prevAnimProgress && animation.progress(prevAnimProgress || 0, true).render(animation.time(), true, true); // must force a re-render because if saveStyles() was used on the target(s), the styles could have been wiped out during the refresh().
            if (isFirstRefresh || prevProgress !== self.progress || containerAnimation || invalidateOnRefresh || animation && !animation._initted) {
                animation && !isToggle && (animation._initted || prevProgress || animation.vars.immediateRender !== false) && animation.totalProgress(containerAnimation && start < -0.001 && !prevProgress ? gsap.utils.normalize(start, end, 0) : prevProgress, true); // to avoid issues where animation callbacks like onStart aren't triggered.
                self.progress = isFirstRefresh || (scroll1 - start) / change === prevProgress ? 0 : prevProgress;
            }
            pin && pinSpacing && (spacer._pinOffset = Math.round(self.progress * pinChange));
            scrubTween && scrubTween.invalidate();
            if (!isNaN(markerStartOffset)) {
                markerStartOffset -= gsap.getProperty(markerStartTrigger, direction.p);
                markerEndOffset -= gsap.getProperty(markerEndTrigger, direction.p);
                _shiftMarker(markerStartTrigger, direction, markerStartOffset);
                _shiftMarker(markerStart, direction, markerStartOffset - (pinOffset || 0));
                _shiftMarker(markerEndTrigger, direction, markerEndOffset);
                _shiftMarker(markerEnd, direction, markerEndOffset - (pinOffset || 0));
            }
            isFirstRefresh && !_refreshingAll && self.update(); // edge case - when you reload a page when it's already scrolled down, some browsers fire a "scroll" event before DOMContentLoaded, triggering an updateAll(). If we don't update the self.progress as part of refresh(), then when it happens next, it may record prevProgress as 0 when it really shouldn't, potentially causing a callback in an animation to fire again.
            if (onRefresh && !_refreshingAll && !executingOnRefresh) {
                executingOnRefresh = true;
                onRefresh(self);
                executingOnRefresh = false;
            }
        };
        self.getVelocity = ()=>(scrollFunc() - scroll2) / (_getTime() - _time2) * 1000 || 0;
        self.endAnimation = ()=>{
            _endAnimation(self.callbackAnimation);
            if (animation) {
                scrubTween ? scrubTween.progress(1) : !animation.paused() ? _endAnimation(animation, animation.reversed()) : isToggle || _endAnimation(animation, self.direction < 0, 1);
            }
        };
        self.labelToScroll = (label)=>animation && animation.labels && (start || self.refresh() || start) + animation.labels[label] / animation.duration() * change || 0;
        self.getTrailing = (name)=>{
            let i = _triggers.indexOf(self), a = self.direction > 0 ? _triggers.slice(0, i).reverse() : _triggers.slice(i + 1);
            return (_isString(name) ? a.filter((t)=>t.vars.preventOverlaps === name) : a).filter((t)=>self.direction > 0 ? t.end <= start : t.start >= end);
        };
        self.update = (reset, recordVelocity, forceFake)=>{
            if (containerAnimation && !forceFake && !reset) {
                return;
            }
            let scroll = _refreshingAll === true ? prevScroll : self.scroll(), p = reset ? 0 : (scroll - start) / change, clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0, prevProgress = self.progress, isActive, wasActive, toggleState, action, stateChanged, toggled, isAtMax, isTakingAction;
            if (recordVelocity) {
                scroll2 = scroll1;
                scroll1 = containerAnimation ? scrollFunc() : scroll;
                if (snap) {
                    snap2 = snap1;
                    snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
                }
            }
            // anticipate the pinning a few ticks ahead of time based on velocity to avoid a visual glitch due to the fact that most browsers do scrolling on a separate thread (not synced with requestAnimationFrame).
            if (anticipatePin && pin && !_refreshing && !_startup && _lastScrollTime) {
                if (!clipped && start < scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin) {
                    clipped = 0.0001;
                } else if (clipped === 1 && end > scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin) {
                    clipped = 0.9999;
                }
            }
            if (clipped !== prevProgress && self.enabled) {
                isActive = self.isActive = !!clipped && clipped < 1;
                wasActive = !!prevProgress && prevProgress < 1;
                toggled = isActive !== wasActive;
                stateChanged = toggled || !!clipped !== !!prevProgress; // could go from start all the way to end, thus it didn't toggle but it did change state in a sense (may need to fire a callback)
                self.direction = clipped > prevProgress ? 1 : -1;
                self.progress = clipped;
                if (stateChanged && !_refreshing) {
                    toggleState = clipped && !prevProgress ? 0 : clipped === 1 ? 1 : prevProgress === 1 ? 2 : 3; // 0 = enter, 1 = leave, 2 = enterBack, 3 = leaveBack (we prioritize the FIRST encounter, thus if you scroll really fast past the onEnter and onLeave in one tick, it'd prioritize onEnter.
                    if (isToggle) {
                        action = !toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1] || toggleActions[toggleState]; // if it didn't toggle, that means it shot right past and since we prioritize the "enter" action, we should switch to the "leave" in this case (but only if one is defined)
                        isTakingAction = animation && (action === "complete" || action === "reset" || action in animation);
                    }
                }
                preventOverlaps && (toggled || isTakingAction) && (isTakingAction || scrub || !animation) && (_isFunction(preventOverlaps) ? preventOverlaps(self) : self.getTrailing(preventOverlaps).forEach((t)=>t.endAnimation()));
                if (!isToggle) {
                    if (scrubTween && !_refreshing && !_startup) {
                        scrubTween._dp._time - scrubTween._start !== scrubTween._time && scrubTween.render(scrubTween._dp._time - scrubTween._start); // if there's a scrub on both the container animation and this one (or a ScrollSmoother), the update order would cause this one not to have rendered yet, so it wouldn't make any progress before we .restart() it heading toward the new progress so it'd appear stuck thus we force a render here.
                        if (scrubTween.resetTo) {
                            scrubTween.resetTo("totalProgress", clipped, animation._tTime / animation._tDur);
                        } else {
                            scrubTween.vars.totalProgress = clipped;
                            scrubTween.invalidate().restart();
                        }
                    } else if (animation) {
                        animation.totalProgress(clipped, !!(_refreshing && (lastRefresh || reset)));
                    }
                }
                if (pin) {
                    reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);
                    if (!useFixedPosition) {
                        pinSetter(_round(pinStart + pinChange * clipped));
                    } else if (stateChanged) {
                        isAtMax = !reset && clipped > prevProgress && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction); // if it's at the VERY end of the page, don't switch away from position: fixed because it's pointless and it could cause a brief flash when the user scrolls back up (when it gets pinned again)
                        if (pinReparent) {
                            if (!reset && (isActive || isAtMax)) {
                                let bounds = _getBounds(pin, true), offset = scroll - start;
                                _reparent(pin, _body, bounds.top + (direction === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"] ? offset : 0) + _px, bounds.left + (direction === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"] ? 0 : offset) + _px);
                            } else {
                                _reparent(pin, spacer);
                            }
                        }
                        _setState(isActive || isAtMax ? pinActiveState : pinState);
                        pinMoves && clipped < 1 && isActive || pinSetter(pinStart + (clipped === 1 && !isAtMax ? pinChange : 0));
                    }
                }
                snap && !tweenTo.tween && !_refreshing && !_startup && snapDelayedCall.restart(true);
                toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach((el)=>el.classList[isActive || once ? "add" : "remove"](toggleClass.className)); // classes could affect positioning, so do it even if reset or refreshing is true.
                onUpdate && !isToggle && !reset && onUpdate(self);
                if (stateChanged && !_refreshing) {
                    if (isToggle) {
                        if (isTakingAction) {
                            if (action === "complete") {
                                animation.pause().totalProgress(1);
                            } else if (action === "reset") {
                                animation.restart(true).pause();
                            } else if (action === "restart") {
                                animation.restart(true);
                            } else {
                                animation[action]();
                            }
                        }
                        onUpdate && onUpdate(self);
                    }
                    if (toggled || !_limitCallbacks) {
                        onToggle && toggled && _callback(self, onToggle);
                        callbacks[toggleState] && _callback(self, callbacks[toggleState]);
                        once && (clipped === 1 ? self.kill(false, 1) : callbacks[toggleState] = 0); // a callback shouldn't be called again if once is true.
                        if (!toggled) {
                            toggleState = clipped === 1 ? 1 : 3;
                            callbacks[toggleState] && _callback(self, callbacks[toggleState]);
                        }
                    }
                    if (fastScrollEnd && !isActive && Math.abs(self.getVelocity()) > (_isNumber(fastScrollEnd) ? fastScrollEnd : 2500)) {
                        _endAnimation(self.callbackAnimation);
                        scrubTween ? scrubTween.progress(1) : _endAnimation(animation, action === "reverse" ? 1 : !clipped, 1);
                    }
                } else if (isToggle && onUpdate && !_refreshing) {
                    onUpdate(self);
                }
            }
            // update absolutely-positioned markers (only if the scroller isn't the viewport)
            if (markerEndSetter) {
                let n = containerAnimation ? scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0) : scroll;
                markerStartSetter(n + (markerStartTrigger._isFlipped ? 1 : 0));
                markerEndSetter(n);
            }
            caMarkerSetter && caMarkerSetter(-scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0));
        };
        self.enable = (reset, refresh)=>{
            if (!self.enabled) {
                self.enabled = true;
                _addListener(scroller, "resize", _onResize);
                isViewport || _addListener(scroller, "scroll", _onScroll);
                onRefreshInit && _addListener(ScrollTrigger, "refreshInit", onRefreshInit);
                if (reset !== false) {
                    self.progress = prevProgress = 0;
                    scroll1 = scroll2 = lastSnap = scrollFunc();
                }
                refresh !== false && self.refresh();
            }
        };
        self.getTween = (snap)=>snap && tweenTo ? tweenTo.tween : scrubTween;
        self.setPositions = (newStart, newEnd, keepClamp, pinOffset)=>{
            if (containerAnimation) {
                let st = containerAnimation.scrollTrigger, duration = containerAnimation.duration(), change = st.end - st.start;
                newStart = st.start + change * newStart / duration;
                newEnd = st.start + change * newEnd / duration;
            }
            self.refresh(false, false, {
                start: _keepClamp(newStart, keepClamp && !!self._startClamp),
                end: _keepClamp(newEnd, keepClamp && !!self._endClamp)
            }, pinOffset);
            self.update();
        };
        self.adjustPinSpacing = (amount)=>{
            if (spacerState && amount) {
                let i = spacerState.indexOf(direction.d) + 1;
                spacerState[i] = parseFloat(spacerState[i]) + amount + _px;
                spacerState[1] = parseFloat(spacerState[1]) + amount + _px;
                _setState(spacerState);
            }
        };
        self.disable = (reset, allowAnimation)=>{
            reset !== false && self.revert(true, true);
            if (self.enabled) {
                self.enabled = self.isActive = false;
                allowAnimation || scrubTween && scrubTween.pause();
                prevScroll = 0;
                pinCache && (pinCache.uncache = 1);
                onRefreshInit && _removeListener(ScrollTrigger, "refreshInit", onRefreshInit);
                if (snapDelayedCall) {
                    snapDelayedCall.pause();
                    tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
                }
                if (!isViewport) {
                    let i = _triggers.length;
                    while(i--){
                        if (_triggers[i].scroller === scroller && _triggers[i] !== self) {
                            return; //don't remove the listeners if there are still other triggers referencing it.
                        }
                    }
                    _removeListener(scroller, "resize", _onResize);
                    isViewport || _removeListener(scroller, "scroll", _onScroll);
                }
            }
        };
        self.kill = (revert, allowAnimation)=>{
            self.disable(revert, allowAnimation);
            scrubTween && !allowAnimation && scrubTween.kill();
            id && delete _ids[id];
            let i = _triggers.indexOf(self);
            i >= 0 && _triggers.splice(i, 1);
            i === _i && _direction > 0 && _i--; // if we're in the middle of a refresh() or update(), splicing would cause skips in the index, so adjust...
            // if no other ScrollTrigger instances of the same scroller are found, wipe out any recorded scroll position. Otherwise, in a single page application, for example, it could maintain scroll position when it really shouldn't.
            i = 0;
            _triggers.forEach((t)=>t.scroller === self.scroller && (i = 1));
            i || _refreshingAll || (self.scroll.rec = 0);
            if (animation) {
                animation.scrollTrigger = null;
                revert && animation.revert({
                    kill: false
                });
                allowAnimation || animation.kill();
            }
            markerStart && [
                markerStart,
                markerEnd,
                markerStartTrigger,
                markerEndTrigger
            ].forEach((m)=>m.parentNode && m.parentNode.removeChild(m));
            _primary === self && (_primary = 0);
            if (pin) {
                pinCache && (pinCache.uncache = 1);
                i = 0;
                _triggers.forEach((t)=>t.pin === pin && i++);
                i || (pinCache.spacer = 0); // if there aren't any more ScrollTriggers with the same pin, remove the spacer, otherwise it could be contaminated with old/stale values if the user re-creates a ScrollTrigger for the same element.
            }
            vars.onKill && vars.onKill(self);
        };
        _triggers.push(self);
        self.enable(false, false);
        customRevertReturn && customRevertReturn(self);
        if (animation && animation.add && !change) {
            let updateFunc = self.update; // some browsers may fire a scroll event BEFORE a tick elapses and/or the DOMContentLoaded fires. So there's a chance update() will be called BEFORE a refresh() has happened on a Timeline-attached ScrollTrigger which means the start/end won't be calculated yet. We don't want to add conditional logic inside the update() method (like check to see if end is defined and if not, force a refresh()) because that's a function that gets hit a LOT (performance). So we swap out the real update() method for this one that'll re-attach it the first time it gets called and of course forces a refresh().
            self.update = ()=>{
                self.update = updateFunc;
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].cache++; // otherwise a cached scroll position may get used in the refresh() in a very rare scenario, like if ScrollTriggers are created inside a DOMContentLoaded event and the queued requestAnimationFrame() fires beforehand. See https://gsap.com/community/forums/topic/41267-scrolltrigger-breaks-on-refresh-when-using-domcontentloaded/
                start || end || self.refresh();
            };
            gsap.delayedCall(0.01, self.update);
            change = 0.01;
            start = end = 0;
        } else {
            self.refresh();
        }
        pin && _queueRefreshAll(); // pinning could affect the positions of other things, so make sure we queue a full refresh()
    }
    static register(core) {
        if (!_coreInitted) {
            gsap = core || _getGSAP();
            _windowExists() && window.document && ScrollTrigger.enable();
            _coreInitted = _enabled;
        }
        return _coreInitted;
    }
    static defaults(config) {
        if (config) {
            for(let p in config){
                _defaults[p] = config[p];
            }
        }
        return _defaults;
    }
    static disable(reset, kill) {
        _enabled = 0;
        _triggers.forEach((trigger)=>trigger[kill ? "kill" : "disable"](reset));
        _removeListener(_win, "wheel", _onScroll);
        _removeListener(_doc, "scroll", _onScroll);
        clearInterval(_syncInterval);
        _removeListener(_doc, "touchcancel", _passThrough);
        _removeListener(_body, "touchstart", _passThrough);
        _multiListener(_removeListener, _doc, "pointerdown,touchstart,mousedown", _pointerDownHandler);
        _multiListener(_removeListener, _doc, "pointerup,touchend,mouseup", _pointerUpHandler);
        _resizeDelay.kill();
        _iterateAutoRefresh(_removeListener);
        for(let i = 0; i < __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].length; i += 3){
            _wheelListener(_removeListener, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"][i], __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"][i + 1]);
            _wheelListener(_removeListener, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"][i], __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"][i + 2]);
        }
    }
    static enable() {
        _win = window;
        _doc = document;
        _docEl = _doc.documentElement;
        _body = _doc.body;
        if (gsap) {
            _toArray = gsap.utils.toArray;
            _clamp = gsap.utils.clamp;
            _context = gsap.core.context || _passThrough;
            _suppressOverwrites = gsap.core.suppressOverwrites || _passThrough;
            _scrollRestoration = _win.history.scrollRestoration || "auto";
            _lastScroll = _win.pageYOffset || 0;
            gsap.core.globals("ScrollTrigger", ScrollTrigger); // must register the global manually because in Internet Explorer, functions (classes) don't have a "name" property.
            if (_body) {
                _enabled = 1;
                _div100vh = document.createElement("div"); // to solve mobile browser address bar show/hide resizing, we shouldn't rely on window.innerHeight. Instead, use a <div> with its height set to 100vh and measure that since that's what the scrolling is based on anyway and it's not affected by address bar showing/hiding.
                _div100vh.style.height = "100vh";
                _div100vh.style.position = "absolute";
                _refresh100vh();
                _rafBugFix();
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].register(gsap);
                // isTouch is 0 if no touch, 1 if ONLY touch, and 2 if it can accommodate touch but also other types like mouse/pointer.
                ScrollTrigger.isTouch = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].isTouch;
                _fixIOSBug = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].isTouch && /(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent); // since 2017, iOS has had a bug that causes event.clientX/Y to be inaccurate when a scroll occurs, thus we must alternate ignoring every other touchmove event to work around it. See https://bugs.webkit.org/show_bug.cgi?id=181954 and https://codepen.io/GreenSock/pen/ExbrPNa/087cef197dc35445a0951e8935c41503
                _ignoreMobileResize = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].isTouch === 1;
                _addListener(_win, "wheel", _onScroll); // mostly for 3rd party smooth scrolling libraries.
                _root = [
                    _win,
                    _doc,
                    _docEl,
                    _body
                ];
                if (gsap.matchMedia) {
                    ScrollTrigger.matchMedia = (vars)=>{
                        let mm = gsap.matchMedia(), p;
                        for(p in vars){
                            mm.add(p, vars[p]);
                        }
                        return mm;
                    };
                    gsap.addEventListener("matchMediaInit", ()=>{
                        _recordScrollPositions();
                        _revertAll();
                    });
                    gsap.addEventListener("matchMediaRevert", ()=>_revertRecorded());
                    gsap.addEventListener("matchMedia", ()=>{
                        _refreshAll(0, 1);
                        _dispatch("matchMedia");
                    });
                    gsap.matchMedia().add("(orientation: portrait)", ()=>{
                        _setBaseDimensions();
                        return _setBaseDimensions;
                    });
                } else {
                    console.warn("Requires GSAP 3.11.0 or later");
                }
                _setBaseDimensions();
                _addListener(_doc, "scroll", _onScroll); // some browsers (like Chrome), the window stops dispatching scroll events on the window if you scroll really fast, but it's consistent on the document!
                let bodyHasStyle = _body.hasAttribute("style"), bodyStyle = _body.style, border = bodyStyle.borderTopStyle, AnimationProto = gsap.core.Animation.prototype, bounds, i;
                AnimationProto.revert || Object.defineProperty(AnimationProto, "revert", {
                    value: function() {
                        return this.time(-0.01, true);
                    }
                }); // only for backwards compatibility (Animation.revert() was added after 3.10.4)
                bodyStyle.borderTopStyle = "solid"; // works around an issue where a margin of a child element could throw off the bounds of the _body, making it seem like there's a margin when there actually isn't. The border ensures that the bounds are accurate.
                bounds = _getBounds(_body);
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"].m = Math.round(bounds.top + __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"].sc()) || 0; // accommodate the offset of the <body> caused by margins and/or padding
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"].m = Math.round(bounds.left + __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"].sc()) || 0;
                border ? bodyStyle.borderTopStyle = border : bodyStyle.removeProperty("border-top-style");
                if (!bodyHasStyle) {
                    _body.setAttribute("style", ""); // it's not enough to just removeAttribute() - we must first set it to empty, otherwise Next.js complains.
                    _body.removeAttribute("style");
                }
                // TODO: (?) maybe move to leveraging the velocity mechanism in Observer and skip intervals.
                _syncInterval = setInterval(_sync, 250);
                gsap.delayedCall(0.5, ()=>_startup = 0);
                _addListener(_doc, "touchcancel", _passThrough); // some older Android devices intermittently stop dispatching "touchmove" events if we don't listen for "touchcancel" on the document.
                _addListener(_body, "touchstart", _passThrough); //works around Safari bug: https://gsap.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/
                _multiListener(_addListener, _doc, "pointerdown,touchstart,mousedown", _pointerDownHandler);
                _multiListener(_addListener, _doc, "pointerup,touchend,mouseup", _pointerUpHandler);
                _transformProp = gsap.utils.checkPrefix("transform");
                _stateProps.push(_transformProp);
                _coreInitted = _getTime();
                _resizeDelay = gsap.delayedCall(0.2, _refreshAll).pause();
                _autoRefresh = [
                    _doc,
                    "visibilitychange",
                    ()=>{
                        let w = _win.innerWidth, h = _win.innerHeight;
                        if (_doc.hidden) {
                            _prevWidth = w;
                            _prevHeight = h;
                        } else if (_prevWidth !== w || _prevHeight !== h) {
                            _onResize();
                        }
                    },
                    _doc,
                    "DOMContentLoaded",
                    _refreshAll,
                    _win,
                    "load",
                    _refreshAll,
                    _win,
                    "resize",
                    _onResize
                ];
                _iterateAutoRefresh(_addListener);
                _triggers.forEach((trigger)=>trigger.enable(0, 1));
                for(i = 0; i < __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].length; i += 3){
                    _wheelListener(_removeListener, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"][i], __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"][i + 1]);
                    _wheelListener(_removeListener, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"][i], __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"][i + 2]);
                }
            } else if (_doc) {
                let onLoad = ()=>{
                    ScrollTrigger.enable();
                    _doc.removeEventListener("DOMContentLoaded", onLoad);
                };
                _doc.addEventListener("DOMContentLoaded", onLoad);
            }
        }
    }
    static config(vars) {
        "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
        let ms = vars.syncInterval;
        ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);
        "ignoreMobileResize" in vars && (_ignoreMobileResize = ScrollTrigger.isTouch === 1 && vars.ignoreMobileResize);
        if ("autoRefreshEvents" in vars) {
            _iterateAutoRefresh(_removeListener) || _iterateAutoRefresh(_addListener, vars.autoRefreshEvents || "none");
            _ignoreResize = (vars.autoRefreshEvents + "").indexOf("resize") === -1;
        }
    }
    static scrollerProxy(target, vars) {
        let t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(target), i = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].indexOf(t), isViewport = _isViewport(t);
        if (~i) {
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].splice(i, isViewport ? 6 : 2);
        }
        if (vars) {
            isViewport ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_proxies"].unshift(_win, vars, _body, vars, _docEl, vars) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_proxies"].unshift(t, vars);
        }
    }
    static clearMatchMedia(query) {
        _triggers.forEach((t)=>t._ctx && t._ctx.query === query && t._ctx.kill(true, true));
    }
    static isInViewport(element, ratio, horizontal) {
        let bounds = (_isString(element) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(element) : element).getBoundingClientRect(), offset = bounds[horizontal ? _width : _height] * ratio || 0;
        return horizontal ? bounds.right - offset > 0 && bounds.left + offset < _win.innerWidth : bounds.bottom - offset > 0 && bounds.top + offset < _win.innerHeight;
    }
    static positionInViewport(element, referencePoint, horizontal) {
        _isString(element) && (element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(element));
        let bounds = element.getBoundingClientRect(), size = bounds[horizontal ? _width : _height], offset = referencePoint == null ? size / 2 : referencePoint in _keywords ? _keywords[referencePoint] * size : ~referencePoint.indexOf("%") ? parseFloat(referencePoint) * size / 100 : parseFloat(referencePoint) || 0;
        return horizontal ? (bounds.left + offset) / _win.innerWidth : (bounds.top + offset) / _win.innerHeight;
    }
    static killAll(allowListeners) {
        _triggers.slice(0).forEach((t)=>t.vars.id !== "ScrollSmoother" && t.kill());
        if (allowListeners !== true) {
            let listeners = _listeners.killAll || [];
            _listeners = {};
            listeners.forEach((f)=>f());
        }
    }
}
ScrollTrigger.version = "3.15.0";
ScrollTrigger.saveStyles = (targets)=>targets ? _toArray(targets).forEach((target)=>{
        if (target && target.style) {
            let i = _savedStyles.indexOf(target);
            i >= 0 && _savedStyles.splice(i, 5);
            _savedStyles.push(target, target.style.cssText, target.getBBox && target.getAttribute("transform"), gsap.core.getCache(target), _context());
        }
    }) : _savedStyles;
ScrollTrigger.revert = (soft, media)=>_revertAll(!soft, media);
ScrollTrigger.create = (vars, animation)=>new ScrollTrigger(vars, animation);
ScrollTrigger.refresh = (safe)=>safe ? _onResize(true) : (_coreInitted || ScrollTrigger.register()) && _refreshAll(true);
ScrollTrigger.update = (force)=>++__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].cache && _updateAll(force === true ? 2 : 0);
ScrollTrigger.clearScrollMemory = _clearScrollMemory;
ScrollTrigger.maxScroll = (element, horizontal)=>_maxScroll(element, horizontal ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"]);
ScrollTrigger.getScrollFunc = (element, horizontal)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getScrollFunc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(element), horizontal ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"]);
ScrollTrigger.getById = (id)=>_ids[id];
ScrollTrigger.getAll = ()=>_triggers.filter((t)=>t.vars.id !== "ScrollSmoother"); // it's common for people to ScrollTrigger.getAll(t => t.kill()) on page routes, for example, and we don't want it to ruin smooth scrolling by killing the main ScrollSmoother one.
ScrollTrigger.isScrolling = ()=>!!_lastScrollTime;
ScrollTrigger.snapDirectional = _snapDirectional;
ScrollTrigger.addEventListener = (type, callback)=>{
    let a = _listeners[type] || (_listeners[type] = []);
    ~a.indexOf(callback) || a.push(callback);
};
ScrollTrigger.removeEventListener = (type, callback)=>{
    let a = _listeners[type], i = a && a.indexOf(callback);
    i >= 0 && a.splice(i, 1);
};
ScrollTrigger.batch = (targets, vars)=>{
    let result = [], varsCopy = {}, interval = vars.interval || 0.016, batchMax = vars.batchMax || 1e9, proxyCallback = (type, callback)=>{
        let elements = [], triggers = [], delay = gsap.delayedCall(interval, ()=>{
            callback(elements, triggers);
            elements = [];
            triggers = [];
        }).pause();
        return (self)=>{
            elements.length || delay.restart(true);
            elements.push(self.trigger);
            triggers.push(self);
            batchMax <= elements.length && delay.progress(1);
        };
    }, p;
    for(p in vars){
        varsCopy[p] = p.substr(0, 2) === "on" && _isFunction(vars[p]) && p !== "onRefreshInit" ? proxyCallback(p, vars[p]) : vars[p];
    }
    if (_isFunction(batchMax)) {
        batchMax = batchMax();
        _addListener(ScrollTrigger, "refresh", ()=>batchMax = vars.batchMax());
    }
    _toArray(targets).forEach((target)=>{
        let config = {};
        for(p in varsCopy){
            config[p] = varsCopy[p];
        }
        config.trigger = target;
        result.push(ScrollTrigger.create(config));
    });
    return result;
};
// to reduce file size. clamps the scroll and also returns a duration multiplier so that if the scroll gets chopped shorter, the duration gets curtailed as well (otherwise if you're very close to the top of the page, for example, and swipe up really fast, it'll suddenly slow down and take a long time to reach the top).
let _clampScrollAndGetDurationMultiplier = (scrollFunc, current, end, max)=>{
    current > max ? scrollFunc(max) : current < 0 && scrollFunc(0);
    return end > max ? (max - current) / (end - current) : end < 0 ? current / (current - end) : 1;
}, _allowNativePanning = (target, direction)=>{
    if (direction === true) {
        target.style.removeProperty("touch-action");
    } else {
        target.style.touchAction = direction === true ? "auto" : direction ? "pan-" + direction + (__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].isTouch ? " pinch-zoom" : "") : "none"; // note: Firefox doesn't support it pinch-zoom properly, at least in addition to a pan-x or pan-y.
    }
    target === _docEl && _allowNativePanning(_body, direction);
}, _overflow = {
    auto: 1,
    scroll: 1
}, _nestedScroll = ({ event, target, axis })=>{
    let node = (event.changedTouches ? event.changedTouches[0] : event).target, cache = node._gsap || gsap.core.getCache(node), time = _getTime(), cs;
    if (!cache._isScrollT || time - cache._isScrollT > 2000) {
        while(node && node !== _body && (node.scrollHeight <= node.clientHeight && node.scrollWidth <= node.clientWidth || !(_overflow[(cs = _getComputedStyle(node)).overflowY] || _overflow[cs.overflowX])))node = node.parentNode;
        cache._isScroll = node && node !== target && !_isViewport(node) && (_overflow[(cs = _getComputedStyle(node)).overflowY] || _overflow[cs.overflowX]);
        cache._isScrollT = time;
    }
    if (cache._isScroll || axis === "x") {
        event.stopPropagation();
        event._gsapAllow = true;
    }
}, // capture events on scrollable elements INSIDE the <body> and allow those by calling stopPropagation() when we find a scrollable ancestor
_inputObserver = (target, type, inputs, nested)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].create({
        target: target,
        capture: true,
        debounce: false,
        lockAxis: true,
        type: type,
        onWheel: nested = nested && _nestedScroll,
        onPress: nested,
        onDrag: nested,
        onScroll: nested,
        onEnable: ()=>inputs && _addListener(_doc, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].eventTypes[0], _captureInputs, false, true),
        onDisable: ()=>_removeListener(_doc, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].eventTypes[0], _captureInputs, true)
    }), _inputExp = /(input|label|select|textarea)/i, _inputIsFocused, _captureInputs = (e)=>{
    let isInput = _inputExp.test(e.target.tagName);
    if (isInput || _inputIsFocused) {
        e._gsapAllow = true;
        _inputIsFocused = isInput;
    }
}, _getScrollNormalizer = (vars)=>{
    _isObject(vars) || (vars = {});
    vars.preventDefault = vars.isNormalizer = vars.allowClicks = true;
    vars.type || (vars.type = "wheel,touch");
    vars.debounce = !!vars.debounce;
    vars.id = vars.id || "normalizer";
    let { normalizeScrollX, momentum, allowNestedScroll, onRelease } = vars, self, maxY, target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(vars.target) || _docEl, smoother = gsap.core.globals().ScrollSmoother, smootherInstance = smoother && smoother.get(), content = _fixIOSBug && (vars.content && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getTarget"])(vars.content) || smootherInstance && vars.content !== false && !smootherInstance.smooth() && smootherInstance.content()), scrollFuncY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getScrollFunc"])(target, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"]), scrollFuncX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getScrollFunc"])(target, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"]), scale = 1, initialScale = (__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"].isTouch && _win.visualViewport ? _win.visualViewport.scale * _win.visualViewport.width : _win.outerWidth) / _win.innerWidth, wheelRefresh = 0, resolveMomentumDuration = _isFunction(momentum) ? ()=>momentum(self) : ()=>momentum || 2.8, lastRefreshID, skipTouchMove, inputObserver = _inputObserver(target, vars.type, true, allowNestedScroll), resumeTouchMove = ()=>skipTouchMove = false, scrollClampX = _passThrough, scrollClampY = _passThrough, updateClamps = ()=>{
        maxY = _maxScroll(target, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"]);
        scrollClampY = _clamp(_fixIOSBug ? 1 : 0, maxY);
        normalizeScrollX && (scrollClampX = _clamp(0, _maxScroll(target, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"])));
        lastRefreshID = _refreshID;
    }, removeContentOffset = ()=>{
        content._gsap.y = _round(parseFloat(content._gsap.y) + scrollFuncY.offset) + "px";
        content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + parseFloat(content._gsap.y) + ", 0, 1)";
        scrollFuncY.offset = scrollFuncY.cacheID = 0;
    }, ignoreDrag = ()=>{
        if (skipTouchMove) {
            requestAnimationFrame(resumeTouchMove);
            let offset = _round(self.deltaY / 2), scroll = scrollClampY(scrollFuncY.v - offset);
            if (content && scroll !== scrollFuncY.v + scrollFuncY.offset) {
                scrollFuncY.offset = scroll - scrollFuncY.v;
                let y = _round((parseFloat(content && content._gsap.y) || 0) - scrollFuncY.offset);
                content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + y + ", 0, 1)";
                content._gsap.y = y + "px";
                scrollFuncY.cacheID = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].cache;
                _updateAll();
            }
            return true;
        }
        scrollFuncY.offset && removeContentOffset();
        skipTouchMove = true;
    }, tween, startScrollX, startScrollY, onStopDelayedCall, onResize = ()=>{
        updateClamps();
        if (tween.isActive() && tween.vars.scrollY > maxY) {
            scrollFuncY() > maxY ? tween.progress(1) && scrollFuncY(maxY) : tween.resetTo("scrollY", maxY);
        }
    };
    content && gsap.set(content, {
        y: "+=0"
    }); // to ensure there's a cache (element._gsap)
    vars.ignoreCheck = (e)=>_fixIOSBug && e.type === "touchmove" && ignoreDrag(e) || scale > 1.05 && e.type !== "touchstart" || self.isGesturing || e.touches && e.touches.length > 1;
    vars.onPress = ()=>{
        skipTouchMove = false;
        let prevScale = scale;
        scale = _round((_win.visualViewport && _win.visualViewport.scale || 1) / initialScale);
        tween.pause();
        prevScale !== scale && _allowNativePanning(target, scale > 1.01 ? true : normalizeScrollX ? false : "x");
        startScrollX = scrollFuncX();
        startScrollY = scrollFuncY();
        updateClamps();
        lastRefreshID = _refreshID;
    };
    vars.onRelease = vars.onGestureStart = (self, wasDragging)=>{
        scrollFuncY.offset && removeContentOffset();
        if (!wasDragging) {
            onStopDelayedCall.restart(true);
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"].cache++; // make sure we're pulling the non-cached value
            // alternate algorithm: durX = Math.min(6, Math.abs(self.velocityX / 800)),	dur = Math.max(durX, Math.min(6, Math.abs(self.velocityY / 800))); dur = dur * (0.4 + (1 - _power4In(dur / 6)) * 0.6)) * (momentumSpeed || 1)
            let dur = resolveMomentumDuration(), currentScroll, endScroll;
            if (normalizeScrollX) {
                currentScroll = scrollFuncX();
                endScroll = currentScroll + dur * 0.05 * -self.velocityX / 0.227; // the constant .227 is from power4(0.05). velocity is inverted because scrolling goes in the opposite direction.
                dur *= _clampScrollAndGetDurationMultiplier(scrollFuncX, currentScroll, endScroll, _maxScroll(target, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_horizontal"]));
                tween.vars.scrollX = scrollClampX(endScroll);
            }
            currentScroll = scrollFuncY();
            endScroll = currentScroll + dur * 0.05 * -self.velocityY / 0.227; // the constant .227 is from power4(0.05)
            dur *= _clampScrollAndGetDurationMultiplier(scrollFuncY, currentScroll, endScroll, _maxScroll(target, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_vertical"]));
            tween.vars.scrollY = scrollClampY(endScroll);
            tween.invalidate().duration(dur).play(0.01);
            if (_fixIOSBug && tween.vars.scrollY >= maxY || currentScroll >= maxY - 1) {
                gsap.to({}, {
                    onUpdate: onResize,
                    duration: dur
                });
            }
        }
        onRelease && onRelease(self);
    };
    vars.onWheel = ()=>{
        tween._ts && tween.pause();
        if (_getTime() - wheelRefresh > 1000) {
            lastRefreshID = 0;
            wheelRefresh = _getTime();
        }
    };
    vars.onChange = (self, dx, dy, xArray, yArray)=>{
        _refreshID !== lastRefreshID && updateClamps();
        dx && normalizeScrollX && scrollFuncX(scrollClampX(xArray[2] === dx ? startScrollX + (self.startX - self.x) : scrollFuncX() + dx - xArray[1])); // for more precision, we track pointer/touch movement from the start, otherwise it'll drift.
        if (dy) {
            scrollFuncY.offset && removeContentOffset();
            let isTouch = yArray[2] === dy, y = isTouch ? startScrollY + self.startY - self.y : scrollFuncY() + dy - yArray[1], yClamped = scrollClampY(y);
            isTouch && y !== yClamped && (startScrollY += yClamped - y);
            scrollFuncY(yClamped);
        }
        (dy || dx) && _updateAll();
    };
    vars.onEnable = ()=>{
        _allowNativePanning(target, normalizeScrollX ? false : "x");
        ScrollTrigger.addEventListener("refresh", onResize);
        _addListener(_win, "resize", onResize);
        if (scrollFuncY.smooth) {
            scrollFuncY.target.style.scrollBehavior = "auto";
            scrollFuncY.smooth = scrollFuncX.smooth = false;
        }
        inputObserver.enable();
    };
    vars.onDisable = ()=>{
        _allowNativePanning(target, true);
        _removeListener(_win, "resize", onResize);
        ScrollTrigger.removeEventListener("refresh", onResize);
        inputObserver.kill();
    };
    vars.lockAxis = vars.lockAxis !== false;
    self = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"](vars);
    self.iOS = _fixIOSBug; // used in the Observer getCachedScroll() function to work around an iOS bug that wreaks havoc with TouchEvent.clientY if we allow scroll to go all the way back to 0.
    _fixIOSBug && !scrollFuncY() && scrollFuncY(1); // iOS bug causes event.clientY values to freak out (wildly inaccurate) if the scroll position is exactly 0.
    _fixIOSBug && gsap.ticker.add(_passThrough); // prevent the ticker from sleeping
    onStopDelayedCall = self._dc;
    tween = gsap.to(self, {
        ease: "power4",
        paused: true,
        inherit: false,
        scrollX: normalizeScrollX ? "+=0.1" : "+=0",
        scrollY: "+=0.1",
        modifiers: {
            scrollY: _interruptionTracker(scrollFuncY, scrollFuncY(), ()=>tween.pause())
        },
        onUpdate: _updateAll,
        onComplete: onStopDelayedCall.vars.onComplete
    }); // we need the modifier to sense if the scroll position is altered outside of the momentum tween (like with a scrollTo tween) so we can pause() it to prevent conflicts.
    return self;
};
ScrollTrigger.sort = (func)=>{
    if (_isFunction(func)) {
        return _triggers.sort(func);
    }
    let scroll = _win.pageYOffset || 0;
    ScrollTrigger.getAll().forEach((t)=>t._sortY = t.trigger ? scroll + t.trigger.getBoundingClientRect().top : t.start + _win.innerHeight);
    return _triggers.sort(func || ((a, b)=>(a.vars.refreshPriority || 0) * -1e6 + (a.vars.containerAnimation ? 1e6 : a._sortY) - ((b.vars.containerAnimation ? 1e6 : b._sortY) + (b.vars.refreshPriority || 0) * -1e6))); // anything with a containerAnimation should refresh last.
};
ScrollTrigger.observe = (vars)=>new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"](vars);
ScrollTrigger.normalizeScroll = (vars)=>{
    if (typeof vars === "undefined") {
        return _normalizer;
    }
    if (vars === true && _normalizer) {
        return _normalizer.enable();
    }
    if (vars === false) {
        _normalizer && _normalizer.kill();
        _normalizer = vars;
        return;
    }
    let normalizer = vars instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Observer"] ? vars : _getScrollNormalizer(vars);
    _normalizer && _normalizer.target === normalizer.target && _normalizer.kill();
    _isViewport(normalizer.target) && (_normalizer = normalizer);
    return normalizer;
};
ScrollTrigger.core = {
    _getVelocityProp: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getVelocityProp"],
    _inputObserver,
    _scrollers: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_scrollers"],
    _proxies: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_proxies"],
    bridge: {
        // when normalizeScroll sets the scroll position (ss = setScroll)
        ss: ()=>{
            _lastScrollTime || _dispatch("scrollStart");
            _lastScrollTime = _getTime();
        },
        // a way to get the _refreshing value in Observer
        ref: ()=>_refreshing
    }
};
_getGSAP() && gsap.registerPlugin(ScrollTrigger);
;
}),
"[project]/apps/web/src/lib/gsap/src/ScrollToPlugin.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollToPlugin",
    ()=>ScrollToPlugin,
    "default",
    ()=>ScrollToPlugin
]);
/*!
 * ScrollToPlugin 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ let gsap, _coreInitted, _window, _docEl, _body, _toArray, _config, ScrollTrigger, _windowExists = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined", _getGSAP = ()=>gsap || _windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap, _isString = (value)=>typeof value === "string", _isFunction = (value)=>typeof value === "function", _max = (element, axis)=>{
    let dim = axis === "x" ? "Width" : "Height", scroll = "scroll" + dim, client = "client" + dim;
    return element === _window || element === _docEl || element === _body ? Math.max(_docEl[scroll], _body[scroll]) - (_window["inner" + dim] || _docEl[client] || _body[client]) : element[scroll] - element["offset" + dim];
}, _buildGetter = (e, axis)=>{
    let p = "scroll" + (axis === "x" ? "Left" : "Top");
    if (e === _window) {
        if (e.pageXOffset != null) {
            p = "page" + axis.toUpperCase() + "Offset";
        } else {
            e = _docEl[p] != null ? _docEl : _body;
        }
    }
    return ()=>e[p];
}, _clean = (value, index, target, targets)=>{
    _isFunction(value) && (value = value(index, target, targets));
    if (typeof value !== "object") {
        return _isString(value) && value !== "max" && value.charAt(1) !== "=" ? {
            x: value,
            y: value
        } : {
            y: value
        }; //if we don't receive an object as the parameter, assume the user intends "y".
    } else if (value.nodeType) {
        return {
            y: value,
            x: value
        };
    } else {
        let result = {}, p;
        for(p in value){
            result[p] = p !== "onAutoKill" && _isFunction(value[p]) ? value[p](index, target, targets) : value[p];
        }
        return result;
    }
}, _getOffset = (element, container)=>{
    element = _toArray(element)[0];
    if (!element || !element.getBoundingClientRect) {
        return console.warn("scrollTo target doesn't exist. Using 0") || {
            x: 0,
            y: 0
        };
    }
    let rect = element.getBoundingClientRect(), isRoot = !container || container === _window || container === _body, cRect = isRoot ? {
        top: _docEl.clientTop - (_window.pageYOffset || _docEl.scrollTop || _body.scrollTop || 0),
        left: _docEl.clientLeft - (_window.pageXOffset || _docEl.scrollLeft || _body.scrollLeft || 0)
    } : container.getBoundingClientRect(), offsets = {
        x: rect.left - cRect.left,
        y: rect.top - cRect.top
    };
    if (!isRoot && container) {
        offsets.x += _buildGetter(container, "x")();
        offsets.y += _buildGetter(container, "y")();
    }
    return offsets;
}, _parseVal = (value, target, axis, currentVal, offset)=>!isNaN(value) && typeof value !== "object" ? parseFloat(value) - offset : _isString(value) && value.charAt(1) === "=" ? parseFloat(value.substr(2)) * (value.charAt(0) === "-" ? -1 : 1) + currentVal - offset : value === "max" ? _max(target, axis) - offset : Math.min(_max(target, axis), _getOffset(value, target)[axis] - offset), _initCore = ()=>{
    gsap = _getGSAP();
    if (_windowExists() && gsap && typeof document !== "undefined" && document.body) //TURBOPACK unreachable
    ;
};
const ScrollToPlugin = {
    version: "3.15.0",
    name: "scrollTo",
    rawVars: 1,
    register (core) {
        gsap = core;
        _initCore();
    },
    init (target, value, tween, index, targets) {
        _coreInitted || _initCore();
        let data = this, snapType = gsap.getProperty(target, "scrollSnapType");
        data.isWin = target === _window;
        data.target = target;
        data.tween = tween;
        value = _clean(value, index, target, targets);
        data.vars = value;
        data.autoKill = !!("autoKill" in value ? value : _config).autoKill;
        data.getX = _buildGetter(target, "x");
        data.getY = _buildGetter(target, "y");
        data.x = data.xPrev = data.getX();
        data.y = data.yPrev = data.getY();
        ScrollTrigger || (ScrollTrigger = gsap.core.globals().ScrollTrigger);
        gsap.getProperty(target, "scrollBehavior") === "smooth" && gsap.set(target, {
            scrollBehavior: "auto"
        });
        if (snapType && snapType !== "none") {
            data.snap = 1;
            data.snapInline = target.style.scrollSnapType;
            target.style.scrollSnapType = "none";
        }
        if (value.x != null) {
            data.add(data, "x", data.x, _parseVal(value.x, target, "x", data.x, value.offsetX || 0), index, targets);
            data._props.push("scrollTo_x");
        } else {
            data.skipX = 1;
        }
        if (value.y != null) {
            data.add(data, "y", data.y, _parseVal(value.y, target, "y", data.y, value.offsetY || 0), index, targets);
            data._props.push("scrollTo_y");
        } else {
            data.skipY = 1;
        }
    },
    render (ratio, data) {
        let pt = data._pt, { target, tween, autoKill, xPrev, yPrev, isWin, snap, snapInline } = data, x, y, yDif, xDif, threshold;
        while(pt){
            pt.r(ratio, pt.d);
            pt = pt._next;
        }
        x = isWin || !data.skipX ? data.getX() : xPrev;
        y = isWin || !data.skipY ? data.getY() : yPrev;
        yDif = y - yPrev;
        xDif = x - xPrev;
        threshold = _config.autoKillThreshold;
        if (data.x < 0) {
            data.x = 0;
        }
        if (data.y < 0) {
            data.y = 0;
        }
        if (autoKill) {
            //note: iOS has a bug that throws off the scroll by several pixels, so we need to check if it's within 7 pixels of the previous one that we set instead of just looking for an exact match.
            if (!data.skipX && (xDif > threshold || xDif < -threshold) && x < _max(target, "x")) {
                data.skipX = 1; //if the user scrolls separately, we should stop tweening!
            }
            if (!data.skipY && (yDif > threshold || yDif < -threshold) && y < _max(target, "y")) {
                data.skipY = 1; //if the user scrolls separately, we should stop tweening!
            }
            if (data.skipX && data.skipY) {
                tween.kill();
                data.vars.onAutoKill && data.vars.onAutoKill.apply(tween, data.vars.onAutoKillParams || []);
            }
        }
        if (isWin) {
            _window.scrollTo(!data.skipX ? data.x : x, !data.skipY ? data.y : y);
        } else {
            data.skipY || (target.scrollTop = data.y);
            data.skipX || (target.scrollLeft = data.x);
        }
        if (snap && (ratio === 1 || ratio === 0)) {
            y = target.scrollTop;
            x = target.scrollLeft;
            snapInline ? target.style.scrollSnapType = snapInline : target.style.removeProperty("scroll-snap-type");
            target.scrollTop = y + 1; // bug in Safari causes the element to totally reset its scroll position when scroll-snap-type changes, so we need to set it to a slightly different value and then back again to work around this bug.
            target.scrollLeft = x + 1;
            target.scrollTop = y;
            target.scrollLeft = x;
        }
        data.xPrev = data.x;
        data.yPrev = data.y;
        ScrollTrigger && ScrollTrigger.update();
    },
    kill (property) {
        let both = property === "scrollTo", i = this._props.indexOf(property);
        if (both || property === "scrollTo_x") {
            this.skipX = 1;
        }
        if (both || property === "scrollTo_y") {
            this.skipY = 1;
        }
        i > -1 && this._props.splice(i, 1);
        return !this._props.length;
    }
};
ScrollToPlugin.max = _max;
ScrollToPlugin.getOffset = _getOffset;
ScrollToPlugin.buildGetter = _buildGetter;
ScrollToPlugin.config = (vars)=>{
    _config || _initCore() || (_config = gsap.config()); // in case the window hasn't been defined yet.
    for(let p in vars){
        _config[p] = vars[p];
    }
};
_getGSAP() && gsap.registerPlugin(ScrollToPlugin);
;
}),
"[project]/apps/web/src/lib/gsap/src/utils/matrix.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Matrix2D",
    ()=>Matrix2D,
    "_getCTM",
    ()=>_getCTM,
    "_getDocScrollLeft",
    ()=>_getDocScrollLeft,
    "_getDocScrollTop",
    ()=>_getDocScrollTop,
    "_isFixed",
    ()=>_isFixed,
    "_setDoc",
    ()=>_setDoc,
    "getGlobalMatrix",
    ()=>getGlobalMatrix
]);
/*!
 * matrix 3.15.0
 * https://gsap.com
 *
 * Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ let _doc, _win, _docElement, _body, _divContainer, _svgContainer, _identityMatrix, _gEl, _transformProp = "transform", _transformOriginProp = _transformProp + "Origin", _hasOffsetBug, _setDoc = (element)=>{
    let doc = element.ownerDocument || element;
    if (!(_transformProp in element.style) && "msTransform" in element.style) {
        _transformProp = "msTransform";
        _transformOriginProp = _transformProp + "Origin";
    }
    while(doc.parentNode && (doc = doc.parentNode)){}
    _win = window;
    _identityMatrix = new Matrix2D();
    if (doc) {
        _doc = doc;
        _docElement = doc.documentElement;
        _body = doc.body;
        _gEl = _doc.createElementNS("http://www.w3.org/2000/svg", "g");
        // prevent any existing CSS from transforming it
        _gEl.style.transform = "none";
        // now test for the offset reporting bug. Use feature detection instead of browser sniffing to make things more bulletproof and future-proof. Hopefully Safari will fix their bug soon.
        let d1 = doc.createElement("div"), d2 = doc.createElement("div"), root = doc && (doc.body || doc.firstElementChild);
        if (root && root.appendChild) {
            root.appendChild(d1);
            d1.appendChild(d2);
            d1.style.position = "static";
            d1.style.transform = "translate3d(0,0,1px)";
            _hasOffsetBug = d2.offsetParent !== d1;
            root.removeChild(d1);
        }
    }
    return doc;
}, _forceNonZeroScale = (e)=>{
    let a, cache;
    while(e && e !== _body){
        cache = e._gsap;
        cache && cache.uncache && cache.get(e, "x"); // force re-parsing of transforms if necessary
        if (cache && !cache.scaleX && !cache.scaleY && cache.renderTransform) {
            cache.scaleX = cache.scaleY = 1e-4;
            cache.renderTransform(1, cache);
            a ? a.push(cache) : a = [
                cache
            ];
        }
        e = e.parentNode;
    }
    return a;
}, // possible future addition: pass an element to _forceDisplay() and it'll walk up all its ancestors and make sure anything with display: none is set to display: block, and if there's no parentNode, it'll add it to the body. It returns an Array that you can then feed to _revertDisplay() to have it revert all the changes it made.
// _forceDisplay = e => {
// 	let a = [],
// 		parent;
// 	while (e && e !== _body) {
// 		parent = e.parentNode;
// 		(_win.getComputedStyle(e).display === "none" || !parent) && a.push(e, e.style.display, parent) && (e.style.display = "block");
// 		parent || _body.appendChild(e);
// 		e = parent;
// 	}
// 	return a;
// },
// _revertDisplay = a => {
// 	for (let i = 0; i < a.length; i+=3) {
// 		a[i+1] ? (a[i].style.display = a[i+1]) : a[i].style.removeProperty("display");
// 		a[i+2] || a[i].parentNode.removeChild(a[i]);
// 	}
// },
_svgTemps = [], _divTemps = [], _getDocScrollTop = ()=>_win.pageYOffset || _doc.scrollTop || _docElement.scrollTop || _body.scrollTop || 0, _getDocScrollLeft = ()=>_win.pageXOffset || _doc.scrollLeft || _docElement.scrollLeft || _body.scrollLeft || 0, _svgOwner = (element)=>element.ownerSVGElement || ((element.tagName + "").toLowerCase() === "svg" ? element : null), _isFixed = (element)=>{
    if (_win.getComputedStyle(element).position === "fixed") {
        return true;
    }
    element = element.parentNode;
    if (element && element.nodeType === 1) {
        return _isFixed(element);
    }
}, _createSibling = (element, i)=>{
    if (element.parentNode && (_doc || _setDoc(element))) {
        let svg = _svgOwner(element), ns = svg ? svg.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml", type = svg ? i ? "rect" : "g" : "div", x = i !== 2 ? 0 : 100, y = i === 3 ? 100 : 0, css = {
            position: "absolute",
            display: "block",
            pointerEvents: "none",
            margin: "0",
            padding: "0"
        }, e = _doc.createElementNS ? _doc.createElementNS(ns.replace(/^https/, "http"), type) : _doc.createElement(type);
        if (i) {
            if (!svg) {
                if (!_divContainer) {
                    _divContainer = _createSibling(element);
                    Object.assign(_divContainer.style, css);
                }
                Object.assign(e.style, css, {
                    width: "0.1px",
                    height: "0.1px",
                    top: y + "px",
                    left: x + "px"
                });
                _divContainer.appendChild(e);
            } else {
                _svgContainer || (_svgContainer = _createSibling(element));
                e.setAttribute("width", 0.01);
                e.setAttribute("height", 0.01);
                e.setAttribute("transform", "translate(" + x + "," + y + ")");
                e.setAttribute("fill", "transparent");
                _svgContainer.appendChild(e);
            }
        }
        return e;
    }
    throw "Need document and parent.";
}, _consolidate = (m)=>{
    let c = new Matrix2D(), i = 0;
    for(; i < m.numberOfItems; i++){
        c.multiply(m.getItem(i).matrix);
    }
    return c;
}, _getCTM = (svg)=>{
    let m = svg.getCTM(), transform;
    if (!m) {
        transform = svg.style[_transformProp];
        svg.style[_transformProp] = "none"; // a bug in Firefox causes css transforms to contaminate the getCTM()
        svg.appendChild(_gEl);
        m = _gEl.getCTM();
        svg.removeChild(_gEl);
        transform ? svg.style[_transformProp] = transform : svg.style.removeProperty(_transformProp.replace(/([A-Z])/g, "-$1").toLowerCase());
    }
    return m || _identityMatrix.clone(); // Firefox will still return null if the <svg> has a width/height of 0 in the browser.
}, _placeSiblings = (element, adjustGOffset)=>{
    let svg = _svgOwner(element), isRootSVG = element === svg, siblings = svg ? _svgTemps : _divTemps, parent = element.parentNode, appendToEl = parent && !svg && parent.shadowRoot && parent.shadowRoot.appendChild ? parent.shadowRoot : parent, container, m, b, x, y, cs;
    if (element === _win) {
        return element;
    }
    siblings.length || siblings.push(_createSibling(element, 1), _createSibling(element, 2), _createSibling(element, 3));
    container = svg ? _svgContainer : _divContainer;
    if (svg) {
        if (isRootSVG) {
            b = _getCTM(element);
            x = -b.e / b.a;
            y = -b.f / b.d;
            m = _identityMatrix;
        } else if (element.getBBox) {
            b = element.getBBox();
            m = element.transform ? element.transform.baseVal : {}; // IE11 doesn't follow the spec.
            m = !m.numberOfItems ? _identityMatrix : m.numberOfItems > 1 ? _consolidate(m) : m.getItem(0).matrix; // don't call m.consolidate().matrix because a bug in Firefox makes pointer events not work when consolidate() is called on the same tick as getBoundingClientRect()! See https://gsap.com/forums/topic/23248-touch-is-not-working-on-draggable-in-firefox-windows-v324/?tab=comments#comment-109800
            x = m.a * b.x + m.c * b.y;
            y = m.b * b.x + m.d * b.y;
        } else {
            m = new Matrix2D();
            x = y = 0;
        }
        if (adjustGOffset && element.tagName.toLowerCase() === "g") {
            x = y = 0;
        }
        (isRootSVG || !element.getBoundingClientRect().width ? svg : parent).appendChild(container); // check getBoundingClientRect().width because things inside a <mask>, for example, may return 0 in which case we need to move the element to the root SVG to properly measure things. An alternative would be to walk up the DOM and see if any ancestor is a nodeName of "mask" and if so, set parent to svg.
        container.setAttribute("transform", "matrix(" + m.a + "," + m.b + "," + m.c + "," + m.d + "," + (m.e + x) + "," + (m.f + y) + ")");
    } else {
        x = y = 0;
        if (_hasOffsetBug) {
            m = element.offsetParent;
            b = element;
            while(b && (b = b.parentNode) && b !== m && b.parentNode){
                if ((_win.getComputedStyle(b)[_transformProp] + "").length > 4) {
                    x = b.offsetLeft;
                    y = b.offsetTop;
                    b = 0;
                }
            }
        }
        cs = _win.getComputedStyle(element);
        if (cs.position !== "absolute" && cs.position !== "fixed") {
            m = element.offsetParent;
            while(parent && parent !== m){
                x += parent.scrollLeft || 0;
                y += parent.scrollTop || 0;
                parent = parent.parentNode;
            }
        }
        b = container.style;
        b.top = element.offsetTop - y + "px";
        b.left = element.offsetLeft - x + "px";
        b[_transformProp] = cs[_transformProp];
        b[_transformOriginProp] = cs[_transformOriginProp];
        // b.border = m.border;
        // b.borderLeftStyle = m.borderLeftStyle;
        // b.borderTopStyle = m.borderTopStyle;
        // b.borderLeftWidth = m.borderLeftWidth;
        // b.borderTopWidth = m.borderTopWidth;
        b.position = cs.position === "fixed" ? "fixed" : "absolute";
        appendToEl.appendChild(container);
    }
    return container;
}, _setMatrix = (m, a, b, c, d, e, f)=>{
    m.a = a;
    m.b = b;
    m.c = c;
    m.d = d;
    m.e = e;
    m.f = f;
    return m;
};
class Matrix2D {
    constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0){
        _setMatrix(this, a, b, c, d, e, f);
    }
    inverse() {
        let { a, b, c, d, e, f } = this, determinant = a * d - b * c || 1e-10;
        return _setMatrix(this, d / determinant, -b / determinant, -c / determinant, a / determinant, (c * f - d * e) / determinant, -(a * f - b * e) / determinant);
    }
    multiply(matrix) {
        let { a, b, c, d, e, f } = this, a2 = matrix.a, b2 = matrix.c, c2 = matrix.b, d2 = matrix.d, e2 = matrix.e, f2 = matrix.f;
        return _setMatrix(this, a2 * a + c2 * c, a2 * b + c2 * d, b2 * a + d2 * c, b2 * b + d2 * d, e + e2 * a + f2 * c, f + e2 * b + f2 * d);
    }
    clone() {
        return new Matrix2D(this.a, this.b, this.c, this.d, this.e, this.f);
    }
    equals(matrix) {
        let { a, b, c, d, e, f } = this;
        return a === matrix.a && b === matrix.b && c === matrix.c && d === matrix.d && e === matrix.e && f === matrix.f;
    }
    apply(point, decoratee = {}) {
        let { x, y } = point, { a, b, c, d, e, f } = this;
        decoratee.x = x * a + y * c + e || 0;
        decoratee.y = x * b + y * d + f || 0;
        return decoratee;
    }
}
function getGlobalMatrix(element, inverse, adjustGOffset, includeScrollInFixed) {
    if (!element || !element.parentNode || (_doc || _setDoc(element)).documentElement === element) {
        return new Matrix2D();
    }
    let zeroScales = _forceNonZeroScale(element), svg = _svgOwner(element), temps = svg ? _svgTemps : _divTemps, container = _placeSiblings(element, adjustGOffset), b1 = temps[0].getBoundingClientRect(), b2 = temps[1].getBoundingClientRect(), b3 = temps[2].getBoundingClientRect(), parent = container.parentNode, isFixed = !includeScrollInFixed && _isFixed(element), m = new Matrix2D((b2.left - b1.left) / 100, (b2.top - b1.top) / 100, (b3.left - b1.left) / 100, (b3.top - b1.top) / 100, b1.left + (isFixed ? 0 : _getDocScrollLeft()), b1.top + (isFixed ? 0 : _getDocScrollTop()));
    parent.removeChild(container);
    if (zeroScales) {
        b1 = zeroScales.length;
        while(b1--){
            b2 = zeroScales[b1];
            b2.scaleX = b2.scaleY = 0;
            b2.renderTransform(1, b2);
        }
    }
    return inverse ? m.inverse() : m;
}
;
 // export function getMatrix(element) {
 // 	_doc || _setDoc(element);
 // 	let m = (_win.getComputedStyle(element)[_transformProp] + "").substr(7).match(/[-.]*\d+[.e\-+]*\d*[e\-\+]*\d*/g),
 // 		is2D = m && m.length === 6;
 // 	return !m || m.length < 6 ? new Matrix2D() : new Matrix2D(+m[0], +m[1], +m[is2D ? 2 : 4], +m[is2D ? 3 : 5], +m[is2D ? 4 : 12], +m[is2D ? 5 : 13]);
 // }
}),
"[project]/apps/web/src/lib/gsap/src/Flip.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Flip",
    ()=>Flip,
    "default",
    ()=>Flip
]);
/*!
 * Flip 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/matrix.js [app-ssr] (ecmascript)");
;
let _id = 1, _toArray, gsap, _batch, _batchAction, _body, _closestTenth, _getStyleSaver, _forEachBatch = (batch, name)=>batch.actions.forEach((a)=>a.vars[name] && a.vars[name](a)), _batchLookup = {}, _RAD2DEG = 180 / Math.PI, _DEG2RAD = Math.PI / 180, _emptyObj = {}, _dashedNameLookup = {}, _memoizedRemoveProps = {}, _listToArray = (list)=>typeof list === "string" ? list.split(" ").join("").split(",") : list, _callbacks = _listToArray("onStart,onUpdate,onComplete,onReverseComplete,onInterrupt"), _removeProps = _listToArray("transform,transformOrigin,width,height,position,top,left,opacity,zIndex,maxWidth,maxHeight,minWidth,minHeight"), _getEl = (target)=>_toArray(target)[0] || console.warn("Element not found:", target), _round = (value)=>Math.round(value * 10000) / 10000 || 0, _toggleClass = (targets, className, action)=>targets.forEach((el)=>el.classList[action](className)), _reserved = {
    zIndex: 1,
    kill: 1,
    simple: 1,
    spin: 1,
    clearProps: 1,
    targets: 1,
    toggleClass: 1,
    onComplete: 1,
    onUpdate: 1,
    onInterrupt: 1,
    onStart: 1,
    delay: 1,
    repeat: 1,
    repeatDelay: 1,
    yoyo: 1,
    scale: 1,
    fade: 1,
    absolute: 1,
    props: 1,
    onEnter: 1,
    onLeave: 1,
    custom: 1,
    paused: 1,
    nested: 1,
    prune: 1,
    absoluteOnLeave: 1
}, _fitReserved = {
    zIndex: 1,
    simple: 1,
    clearProps: 1,
    scale: 1,
    absolute: 1,
    fitChild: 1,
    getVars: 1,
    props: 1
}, _camelToDashed = (p)=>p.replace(/([A-Z])/g, "-$1").toLowerCase(), _copy = (obj, exclude)=>{
    let result = {}, p;
    for(p in obj){
        exclude[p] || (result[p] = obj[p]);
    }
    return result;
}, _memoizedProps = {}, _memoizeProps = (props)=>{
    let p = _memoizedProps[props] = _listToArray(props);
    _memoizedRemoveProps[props] = p.concat(_removeProps);
    return p;
}, _getInverseGlobalMatrix = (el)=>{
    let cache = el._gsap || gsap.core.getCache(el);
    if (cache.gmCache === gsap.ticker.frame) {
        return cache.gMatrix;
    }
    cache.gmCache = gsap.ticker.frame;
    return cache.gMatrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(el, true, false, true);
}, _getDOMDepth = (el, invert, level = 0)=>{
    let parent = el.parentNode, inc = 1000 * 10 ** level * (invert ? -1 : 1), l = invert ? -inc * 900 : 0;
    while(el){
        l += inc;
        el = el.previousSibling;
    }
    return parent ? l + _getDOMDepth(parent, invert, level + 1) : l;
}, _orderByDOMDepth = (comps, invert, isElStates)=>{
    comps.forEach((comp)=>comp.d = _getDOMDepth(isElStates ? comp.element : comp.t, invert));
    comps.sort((c1, c2)=>c1.d - c2.d);
    return comps;
}, _recordInlineStyles = (elState, props)=>{
    let style = elState.element.style, a = elState.css = elState.css || [], i = props.length, p, v;
    while(i--){
        p = props[i];
        v = style[p] || style.getPropertyValue(p);
        a.push(v ? p : _dashedNameLookup[p] || (_dashedNameLookup[p] = _camelToDashed(p)), v);
    }
    return style;
}, _applyInlineStyles = (state)=>{
    let css = state.css, style = state.element.style, i = 0;
    state.cache.uncache = 1;
    for(; i < css.length; i += 2){
        css[i + 1] ? style[css[i]] = css[i + 1] : style.removeProperty(css[i]);
    }
    if (!css[css.indexOf("transform") + 1] && style.translate) {
        style.removeProperty("translate");
        style.removeProperty("scale");
        style.removeProperty("rotate");
    }
}, _setFinalStates = (comps, onlyTransforms)=>{
    comps.forEach((c)=>c.a.cache.uncache = 1);
    onlyTransforms || comps.finalStates.forEach(_applyInlineStyles);
}, _absoluteProps = "paddingTop,paddingRight,paddingBottom,paddingLeft,gridArea,transition".split(","), _makeAbsolute = (elState, fallbackNode, ignoreBatch)=>{
    let { element, width, height, uncache, getProp } = elState, style = element.style, i = 4, result, displayIsNone, cs;
    typeof fallbackNode !== "object" && (fallbackNode = elState);
    if (_batch && ignoreBatch !== 1) {
        _batch._abs.push({
            t: element,
            b: elState,
            a: elState,
            sd: 0
        });
        _batch._final.push(()=>(elState.cache.uncache = 1) && _applyInlineStyles(elState));
        return element;
    }
    displayIsNone = getProp("display") === "none";
    if (!elState.isVisible || displayIsNone) {
        displayIsNone && (_recordInlineStyles(elState, [
            "display"
        ]).display = fallbackNode.display);
        elState.matrix = fallbackNode.matrix;
        elState.width = width = elState.width || fallbackNode.width;
        elState.height = height = elState.height || fallbackNode.height;
    }
    _recordInlineStyles(elState, _absoluteProps);
    cs = window.getComputedStyle(element);
    while(i--){
        style[_absoluteProps[i]] = cs[_absoluteProps[i]]; // record paddings as px-based because if removed from grid, percentage-based ones could be altered.
    }
    style.gridArea = "1 / 1 / 1 / 1";
    style.transition = "none";
    style.position = "absolute";
    style.width = width + "px";
    style.height = height + "px";
    style.top || (style.top = "0px");
    style.left || (style.left = "0px");
    if (uncache) {
        result = new ElementState(element);
    } else {
        result = _copy(elState, _emptyObj);
        result.position = "absolute";
        if (elState.simple) {
            let bounds = element.getBoundingClientRect();
            result.matrix = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Matrix2D"](1, 0, 0, 1, bounds.left + (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getDocScrollLeft"])(), bounds.top + (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getDocScrollTop"])());
        } else {
            result.matrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(element, false, false, true);
        }
    }
    result = _fit(result, elState, true);
    elState.x = _closestTenth(result.x, 0.01);
    elState.y = _closestTenth(result.y, 0.01);
    return element;
}, _filterComps = (comps, targets)=>{
    if (targets !== true) {
        targets = _toArray(targets);
        comps = comps.filter((c)=>{
            if (targets.indexOf((c.sd < 0 ? c.b : c.a).element) !== -1) {
                return true;
            } else {
                c.t._gsap.renderTransform(1); // we must force transforms to render on anything that isn't being made position: absolute, otherwise the absolute position happens and then when animation begins it applies transforms which can create a new stacking context, throwing off positioning!
                if (c.b.isVisible) {
                    c.t.style.width = c.b.width + "px"; // otherwise things can collapse when contents are made position: absolute.
                    c.t.style.height = c.b.height + "px";
                }
            }
        });
    }
    return comps;
}, _makeCompsAbsolute = (comps)=>_orderByDOMDepth(comps, true).forEach((c)=>(c.a.isVisible || c.b.isVisible) && _makeAbsolute(c.sd < 0 ? c.b : c.a, c.b, 1)), _findElStateInState = (state, other)=>other && state.idLookup[_parseElementState(other).id] || state.elementStates[0], _parseElementState = (elOrNode, props, simple, other)=>elOrNode instanceof ElementState ? elOrNode : elOrNode instanceof FlipState ? _findElStateInState(elOrNode, other) : new ElementState(typeof elOrNode === "string" ? _getEl(elOrNode) || console.warn(elOrNode + " not found") : elOrNode, props, simple), _recordProps = (elState, props)=>{
    let getProp = gsap.getProperty(elState.element, null, "native"), obj = elState.props = {}, i = props.length;
    while(i--){
        obj[props[i]] = (getProp(props[i]) + "").trim();
    }
    obj.zIndex && (obj.zIndex = parseFloat(obj.zIndex) || 0);
    return elState;
}, _applyProps = (element, props)=>{
    let style = element.style || element, p;
    for(p in props){
        style[p] = props[p];
    }
}, _getID = (el)=>{
    let id = el.getAttribute("data-flip-id");
    id || el.setAttribute("data-flip-id", id = "auto-" + _id++);
    return id;
}, _elementsFromElementStates = (elStates)=>elStates.map((elState)=>elState.element), _handleCallback = (callback, elStates, tl)=>callback && elStates.length && tl.add(callback(_elementsFromElementStates(elStates), tl, new FlipState(elStates, 0, true)), 0), _fit = (fromState, toState, scale, applyProps, fitChild, vars)=>{
    let { element, cache, parent, x, y } = fromState, { width, height, scaleX, scaleY, rotation, bounds } = toState, styles = vars && _getStyleSaver && _getStyleSaver(element, "transform,width,height"), dimensionState = fromState, { e, f } = toState.matrix, deep = fromState.bounds.width !== bounds.width || fromState.bounds.height !== bounds.height || fromState.scaleX !== scaleX || fromState.scaleY !== scaleY || fromState.rotation !== rotation, simple = !deep && fromState.simple && toState.simple && !fitChild, skewX, fromPoint, toPoint, getProp, parentMatrix, matrix, bbox;
    if (simple || !parent) {
        scaleX = scaleY = 1;
        rotation = skewX = 0;
    } else {
        parentMatrix = _getInverseGlobalMatrix(parent);
        matrix = parentMatrix.clone().multiply(toState.ctm ? toState.matrix.clone().multiply(toState.ctm) : toState.matrix); // root SVG elements have a ctm that we must factor out (for example, viewBox:"0 0 94 94" with a width of 200px would scale the internals by 2.127 but when we're matching the size of the root <svg> element itself, that scaling shouldn't factor in!)
        rotation = _round(Math.atan2(matrix.b, matrix.a) * _RAD2DEG);
        skewX = _round(Math.atan2(matrix.c, matrix.d) * _RAD2DEG + rotation) % 360; // in very rare cases, minor rounding might end up with 360 which should be 0.
        scaleX = Math.sqrt(matrix.a ** 2 + matrix.b ** 2);
        scaleY = Math.sqrt(matrix.c ** 2 + matrix.d ** 2) * Math.cos(skewX * _DEG2RAD);
        if (fitChild) {
            fitChild = _toArray(fitChild)[0];
            getProp = gsap.getProperty(fitChild);
            bbox = fitChild.getBBox && typeof fitChild.getBBox === "function" && fitChild.getBBox();
            dimensionState = {
                scaleX: getProp("scaleX"),
                scaleY: getProp("scaleY"),
                width: bbox ? bbox.width : Math.ceil(parseFloat(getProp("width", "px"))),
                height: bbox ? bbox.height : parseFloat(getProp("height", "px"))
            };
        }
        cache.rotation = rotation + "deg";
        cache.skewX = skewX + "deg";
    }
    if (scale) {
        scaleX *= width === dimensionState.width || !dimensionState.width ? 1 : width / dimensionState.width; // note if widths are both 0, we should make scaleX 1 - some elements have box-sizing that incorporates padding, etc. and we don't want it to collapse in that case.
        scaleY *= height === dimensionState.height || !dimensionState.height ? 1 : height / dimensionState.height;
        cache.scaleX = scaleX;
        cache.scaleY = scaleY;
    } else {
        width = _closestTenth(width * scaleX / dimensionState.scaleX, 0);
        height = _closestTenth(height * scaleY / dimensionState.scaleY, 0);
        element.style.width = width + "px";
        element.style.height = height + "px";
    }
    // if (fromState.isFixed) { // commented out because it's now taken care of in getGlobalMatrix() with a flag at the end.
    // 	e -= _getDocScrollLeft();
    // 	f -= _getDocScrollTop();
    // }
    applyProps && _applyProps(element, toState.props);
    if (simple || !parent) {
        x += e - fromState.matrix.e;
        y += f - fromState.matrix.f;
    } else if (deep || parent !== toState.parent) {
        cache.x = x + "px";
        cache.y = y + "px";
        cache.renderTransform(1, cache);
        matrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(fitChild || element, false, false, true);
        fromPoint = parentMatrix.apply({
            x: matrix.e,
            y: matrix.f
        });
        toPoint = parentMatrix.apply({
            x: e,
            y: f
        });
        x += toPoint.x - fromPoint.x;
        y += toPoint.y - fromPoint.y;
    } else {
        parentMatrix.e = parentMatrix.f = 0;
        toPoint = parentMatrix.apply({
            x: e - fromState.matrix.e,
            y: f - fromState.matrix.f
        });
        x += toPoint.x;
        y += toPoint.y;
    }
    x = _closestTenth(x, 0.02);
    y = _closestTenth(y, 0.02);
    if (vars && !(vars instanceof ElementState)) {
        styles && styles.revert();
    } else {
        cache.x = x + "px";
        cache.y = y + "px";
        cache.renderTransform(1, cache);
    }
    if (vars) {
        vars.x = x;
        vars.y = y;
        vars.rotation = rotation;
        vars.skewX = skewX;
        if (scale) {
            vars.scaleX = scaleX;
            vars.scaleY = scaleY;
        } else {
            vars.width = width;
            vars.height = height;
        }
    }
    return vars || cache;
}, _parseState = (targetsOrState, vars)=>targetsOrState instanceof FlipState ? targetsOrState : new FlipState(targetsOrState, vars), _getChangingElState = (toState, fromState, id)=>{
    let to1 = toState.idLookup[id], to2 = toState.alt[id];
    return to2.isVisible && (!(fromState.getElementState(to2.element) || to2).isVisible || !to1.isVisible) ? to2 : to1;
}, _bodyMetrics = [], _bodyProps = "width,height,overflowX,overflowY".split(","), _bodyLocked, _lockBodyScroll = (lock)=>{
    if (lock !== _bodyLocked) {
        let s = _body.style, w = _body.clientWidth === window.outerWidth, h = _body.clientHeight === window.outerHeight, i = 4;
        if (lock && (w || h)) {
            while(i--){
                _bodyMetrics[i] = s[_bodyProps[i]];
            }
            if (w) {
                s.width = _body.clientWidth + "px";
                s.overflowY = "hidden";
            }
            if (h) {
                s.height = _body.clientHeight + "px";
                s.overflowX = "hidden";
            }
            _bodyLocked = lock;
        } else if (_bodyLocked) {
            while(i--){
                _bodyMetrics[i] ? s[_bodyProps[i]] = _bodyMetrics[i] : s.removeProperty(_camelToDashed(_bodyProps[i]));
            }
            _bodyLocked = lock;
        }
    }
}, _revertTempStyles = (temps, stateIndex)=>{
    for(let i = 0; i < temps.length; i += 3){
        gsap.set(temps[i], {
            clearProps: true
        }); // to clear cached transforms too
        temps[i].setAttribute("style", temps[i + stateIndex]);
        temps[i]._gsap.gmCache = -1; // bust the globalMatrix cache
    }
}, _fromTo = (fromState, toState, vars, relative)=>{
    fromState instanceof FlipState && toState instanceof FlipState || console.warn("Not a valid state object.");
    vars = vars || {};
    let { clearProps, onEnter, onLeave, absolute, absoluteOnLeave, custom, delay, paused, repeat, repeatDelay, yoyo, toggleClass, nested, zIndex, scale, fade, stagger, spin, prune } = vars, props = ("props" in vars ? vars : fromState).props, tweenVars = _copy(vars, _reserved), animation = gsap.timeline({
        delay,
        paused,
        repeat,
        repeatDelay,
        yoyo,
        data: "isFlip"
    }), remainingProps = tweenVars, entering = [], leaving = [], comps = [], swapOutTargets = [], spinNum = spin === true ? 1 : spin || 0, spinFunc = typeof spin === "function" ? spin : ()=>spinNum, interrupted = fromState.interrupted || toState.interrupted, addFunc = animation[relative !== 1 ? "to" : "from"], v, p, endTime, i, el, comp, state, targets, finalStates, fromNode, toNode, run, a, b;
    //relative || (toState = (new FlipState(toState.targets, {props: props})).fit(toState, scale));
    for(p in toState.idLookup){
        toNode = !toState.alt[p] ? toState.idLookup[p] : _getChangingElState(toState, fromState, p);
        el = toNode.element;
        fromNode = fromState.idLookup[p];
        fromState.alt[p] && el === fromNode.element && (fromState.alt[p].isVisible || !toNode.isVisible) && (fromNode = fromState.alt[p]);
        if (fromNode) {
            comp = {
                t: el,
                b: fromNode,
                a: toNode,
                sd: fromNode.element === el ? 0 : toNode.isVisible ? 1 : -1
            };
            comps.push(comp);
            if (comp.sd) {
                if (comp.sd < 0) {
                    comp.b = toNode;
                    comp.a = fromNode;
                }
                // for swapping elements that got interrupted, we must re-record the inline styles to ensure they're not tainted. Remember, .batch() permits getState() not to force in-progress flips to their end state.
                interrupted && _recordInlineStyles(comp.b, props ? _memoizedRemoveProps[props] : _removeProps);
                fade && comps.push(comp.swap = {
                    t: fromNode.element,
                    b: comp.b,
                    a: comp.a,
                    sd: -comp.sd,
                    swap: comp
                });
            }
            el._flip = fromNode.element._flip = _batch ? _batch.timeline : animation;
        } else if (toNode.isVisible) {
            comps.push({
                t: el,
                b: _copy(toNode, {
                    isVisible: 1
                }),
                a: toNode,
                sd: 0,
                entering: 1
            }); // to include it in the "entering" Array and do absolute positioning if necessary
            el._flip = _batch ? _batch.timeline : animation;
        }
    }
    props && (_memoizedProps[props] || _memoizeProps(props)).forEach((p)=>tweenVars[p] = (i)=>comps[i].a.props[p]);
    comps.finalStates = finalStates = [];
    run = ()=>{
        _orderByDOMDepth(comps);
        _lockBodyScroll(true); // otherwise, measurements may get thrown off when things get fit.
        let recordedStyles = [];
        for(i = 0; i < comps.length; i++){
            comp = comps[i];
            a = comp.a;
            b = comp.b;
            if (prune && !a.isDifferent(b) && !comp.entering) {
                comps.splice(i--, 1);
            } else {
                el = comp.t;
                if (nested && !(comp.sd < 0) && i) {
                    a = comp.a = a.clone({
                        matrix: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(el, false, false, true)
                    });
                }
                if (b.isVisible && a.isVisible) {
                    if (comp.sd < 0) {
                        nested && _revertTempStyles(recordedStyles, 1); // get the ancestor elements into the final state for proper measuring
                        state = new ElementState(el, props, fromState.simple);
                        _fit(state, a, scale, 0, 0, state);
                        state.matrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(el, false, false, true);
                        state.bounds = el.getBoundingClientRect();
                        state.css = comp.b.css;
                        comp.a = a = state;
                        fade && (el.style.opacity = interrupted ? b.opacity : a.opacity);
                        stagger && swapOutTargets.push(el);
                        if (nested) {
                            _revertTempStyles(recordedStyles, 2); // now return the ancestor elements back to the before state
                            recordedStyles.push(el, el.getAttribute("style"));
                        }
                    } else if (comp.sd > 0 && fade) {
                        el.style.opacity = interrupted ? a.opacity - b.opacity : "0";
                    }
                    _fit(a, b, scale, props);
                    nested && comp.sd < 0 && recordedStyles.push(el.getAttribute("style"));
                } else if (b.isVisible !== a.isVisible) {
                    if (!b.isVisible) {
                        a.isVisible && entering.push(a);
                        comps.splice(i--, 1);
                    } else if (!a.isVisible) {
                        b.css = a.css;
                        leaving.push(b);
                        comps.splice(i--, 1);
                        absolute && nested && _fit(a, b, scale, props);
                    }
                }
                if (!scale) {
                    el.style.maxWidth = Math.max(a.width, b.width) + "px";
                    el.style.maxHeight = Math.max(a.height, b.height) + "px";
                    el.style.minWidth = Math.min(a.width, b.width) + "px";
                    el.style.minHeight = Math.min(a.height, b.height) + "px";
                }
                nested && toggleClass && el.classList.add(toggleClass);
            }
            finalStates.push(a);
        }
        let classTargets;
        if (toggleClass) {
            classTargets = finalStates.map((s)=>s.element);
            nested && classTargets.forEach((e)=>e.classList.remove(toggleClass)); // there could be a delay, so don't leave the classes applied (we'll do it in a timeline callback)
        }
        _lockBodyScroll(false);
        if (scale) {
            tweenVars.scaleX = (i)=>comps[i].a.scaleX;
            tweenVars.scaleY = (i)=>comps[i].a.scaleY;
        } else {
            tweenVars.width = (i)=>comps[i].a.width + "px";
            tweenVars.height = (i)=>comps[i].a.height + "px";
            tweenVars.autoRound = vars.autoRound || false;
        }
        tweenVars.x = (i)=>comps[i].a.x + "px";
        tweenVars.y = (i)=>comps[i].a.y + "px";
        tweenVars.rotation = (i)=>comps[i].a.rotation + (spin ? spinFunc(i, targets[i], targets) * 360 : 0);
        tweenVars.skewX = (i)=>comps[i].a.skewX;
        targets = comps.map((c)=>c.t);
        if (zIndex || zIndex === 0) {
            tweenVars.modifiers = {
                zIndex: ()=>zIndex
            };
            tweenVars.zIndex = zIndex;
            tweenVars.immediateRender = vars.immediateRender !== false;
        }
        fade && (tweenVars.opacity = (i)=>comps[i].sd < 0 ? 0 : comps[i].sd > 0 ? comps[i].a.opacity : "+=0");
        if (swapOutTargets.length) {
            stagger = gsap.utils.distribute(stagger);
            let dummyArray = targets.slice(swapOutTargets.length);
            tweenVars.stagger = (i, el)=>stagger(~swapOutTargets.indexOf(el) ? targets.indexOf(comps[i].swap.t) : i, el, dummyArray);
        }
        // // for testing...
        // gsap.delayedCall(vars.data ? 50 : 1, function() {
        // 	animation.eventCallback("onComplete", () => _setFinalStates(comps, !clearProps));
        // 	addFunc.call(animation, targets, tweenVars, 0).play();
        // });
        // return;
        _callbacks.forEach((name)=>vars[name] && animation.eventCallback(name, vars[name], vars[name + "Params"])); // apply callbacks to the timeline, not tweens (because "custom" timing can make multiple tweens)
        if (custom && targets.length) {
            remainingProps = _copy(tweenVars, _reserved);
            if ("scale" in custom) {
                custom.scaleX = custom.scaleY = custom.scale;
                delete custom.scale;
            }
            for(p in custom){
                v = _copy(custom[p], _fitReserved);
                v[p] = tweenVars[p];
                !("duration" in v) && "duration" in tweenVars && (v.duration = tweenVars.duration);
                v.stagger = tweenVars.stagger;
                addFunc.call(animation, targets, v, 0);
                delete remainingProps[p];
            }
        }
        if (targets.length || leaving.length || entering.length) {
            toggleClass && animation.add(()=>_toggleClass(classTargets, toggleClass, animation._zTime < 0 ? "remove" : "add"), 0) && !paused && _toggleClass(classTargets, toggleClass, "add");
            targets.length && addFunc.call(animation, targets, remainingProps, 0);
        }
        _handleCallback(onEnter, entering, animation);
        _handleCallback(onLeave, leaving, animation);
        let batchTl = _batch && _batch.timeline;
        if (batchTl) {
            batchTl.add(animation, 0);
            _batch._final.push(()=>_setFinalStates(comps, !clearProps));
        }
        endTime = animation.duration();
        animation.call(()=>{
            let forward = animation.time() >= endTime;
            forward && !batchTl && _setFinalStates(comps, !clearProps);
            toggleClass && _toggleClass(classTargets, toggleClass, forward ? "remove" : "add");
        });
    };
    absoluteOnLeave && (absolute = comps.filter((comp)=>!comp.sd && !comp.a.isVisible && comp.b.isVisible).map((comp)=>comp.a.element));
    if (_batch) {
        absolute && _batch._abs.push(..._filterComps(comps, absolute));
        _batch._run.push(run);
    } else {
        absolute && _makeCompsAbsolute(_filterComps(comps, absolute)); // when making absolute, we must go in a very particular order so that document flow changes don't affect things. Don't make it visible if both the before and after states are invisible! There's no point, and it could make things appear visible during the flip that shouldn't be.
        run();
    }
    let anim = _batch ? _batch.timeline : animation;
    anim.revert = ()=>_killFlip(anim, 1, 1); // a Flip timeline should behave very different when reverting - it should actually jump to the end so that styles get cleared out.
    return anim;
}, _interrupt = (tl)=>{
    tl.vars.onInterrupt && tl.vars.onInterrupt.apply(tl, tl.vars.onInterruptParams || []);
    tl.getChildren(true, false, true).forEach(_interrupt);
}, _killFlip = (tl, action, force)=>{
    if (tl && tl.progress() < 1 && (!tl.paused() || force)) {
        if (action) {
            _interrupt(tl);
            action < 2 && tl.progress(1); // we should also kill it in case it was added to a parent timeline.
            tl.kill();
        }
        return true;
    }
}, _createLookup = (state)=>{
    let lookup = state.idLookup = {}, alt = state.alt = {}, elStates = state.elementStates, i = elStates.length, elState;
    while(i--){
        elState = elStates[i];
        lookup[elState.id] ? alt[elState.id] = elState : lookup[elState.id] = elState;
    }
};
class FlipState {
    constructor(targets, vars, targetsAreElementStates){
        this.props = vars && vars.props;
        this.simple = !!(vars && vars.simple);
        if (targetsAreElementStates) {
            this.targets = _elementsFromElementStates(targets);
            this.elementStates = targets;
            _createLookup(this);
        } else {
            this.targets = _toArray(targets);
            let soft = vars && (vars.kill === false || vars.batch && !vars.kill);
            _batch && !soft && _batch._kill.push(this);
            this.update(soft || !!_batch); // when batching, don't force in-progress flips to their end; we need to do that AFTER all getStates() are called.
        }
    }
    update(soft) {
        this.elementStates = this.targets.map((el)=>new ElementState(el, this.props, this.simple));
        _createLookup(this);
        this.interrupt(soft);
        this.recordInlineStyles();
        return this;
    }
    clear() {
        this.targets.length = this.elementStates.length = 0;
        _createLookup(this);
        return this;
    }
    fit(state, scale, nested) {
        let elStatesInOrder = _orderByDOMDepth(this.elementStates.slice(0), false, true), toElStates = (state || this).idLookup, i = 0, fromNode, toNode;
        for(; i < elStatesInOrder.length; i++){
            fromNode = elStatesInOrder[i];
            nested && (fromNode.matrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(fromNode.element, false, false, true)); // moving a parent affects the position of children
            toNode = toElStates[fromNode.id];
            toNode && _fit(fromNode, toNode, scale, true, 0, fromNode);
            fromNode.matrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(fromNode.element, false, false, true);
        }
        return this;
    }
    getProperty(element, property) {
        let es = this.getElementState(element) || _emptyObj;
        return (property in es ? es : es.props || _emptyObj)[property];
    }
    add(state) {
        let i = state.targets.length, lookup = this.idLookup, alt = this.alt, index, es, es2;
        while(i--){
            es = state.elementStates[i];
            es2 = lookup[es.id];
            if (es2 && (es.element === es2.element || alt[es.id] && alt[es.id].element === es.element)) {
                index = this.elementStates.indexOf(es.element === es2.element ? es2 : alt[es.id]);
                this.targets.splice(index, 1, state.targets[i]);
                this.elementStates.splice(index, 1, es);
            } else {
                this.targets.push(state.targets[i]);
                this.elementStates.push(es);
            }
        }
        state.interrupted && (this.interrupted = true);
        state.simple || (this.simple = false);
        _createLookup(this);
        return this;
    }
    compare(state) {
        let l1 = state.idLookup, l2 = this.idLookup, unchanged = [], changed = [], enter = [], leave = [], targets = [], a1 = state.alt, a2 = this.alt, place = (s1, s2, el)=>(s1.isVisible !== s2.isVisible ? s1.isVisible ? enter : leave : s1.isVisible ? changed : unchanged).push(el) && targets.push(el), placeIfDoesNotExist = (s1, s2, el)=>targets.indexOf(el) < 0 && place(s1, s2, el), s1, s2, p, el, s1Alt, s2Alt, c1, c2;
        for(p in l1){
            s1Alt = a1[p];
            s2Alt = a2[p];
            s1 = !s1Alt ? l1[p] : _getChangingElState(state, this, p);
            el = s1.element;
            s2 = l2[p];
            if (s2Alt) {
                c2 = s2.isVisible || !s2Alt.isVisible && el === s2.element ? s2 : s2Alt;
                c1 = s1Alt && !s1.isVisible && !s1Alt.isVisible && c2.element === s1Alt.element ? s1Alt : s1;
                //c1.element !== c2.element && c1.element === s2.element && (c2 = s2);
                if (c1.isVisible && c2.isVisible && c1.element !== c2.element) {
                    (c1.isDifferent(c2) ? changed : unchanged).push(c1.element, c2.element);
                    targets.push(c1.element, c2.element);
                } else {
                    place(c1, c2, c1.element);
                }
                s1Alt && c1.element === s1Alt.element && (s1Alt = l1[p]);
                placeIfDoesNotExist(c1.element !== s2.element && s1Alt ? s1Alt : c1, s2, s2.element);
                placeIfDoesNotExist(s1Alt && s1Alt.element === s2Alt.element ? s1Alt : c1, s2Alt, s2Alt.element);
                s1Alt && placeIfDoesNotExist(s1Alt, s2Alt.element === s1Alt.element ? s2Alt : s2, s1Alt.element);
            } else {
                !s2 ? enter.push(el) : !s2.isDifferent(s1) ? unchanged.push(el) : place(s1, s2, el);
                s1Alt && placeIfDoesNotExist(s1Alt, s2, s1Alt.element);
            }
        }
        for(p in l2){
            if (!l1[p]) {
                leave.push(l2[p].element);
                a2[p] && leave.push(a2[p].element);
            }
        }
        return {
            changed,
            unchanged,
            enter,
            leave
        };
    }
    recordInlineStyles() {
        let props = _memoizedRemoveProps[this.props] || _removeProps, i = this.elementStates.length;
        while(i--){
            _recordInlineStyles(this.elementStates[i], props);
        }
    }
    interrupt(soft) {
        let timelines = [];
        this.targets.forEach((t)=>{
            let tl = t._flip, foundInProgress = _killFlip(tl, soft ? 0 : 1);
            soft && foundInProgress && timelines.indexOf(tl) < 0 && tl.add(()=>this.updateVisibility());
            foundInProgress && timelines.push(tl);
        });
        !soft && timelines.length && this.updateVisibility(); // if we found an in-progress Flip animation, we must record all the values in their current state at that point BUT we should update the isVisible value AFTER pushing that flip to completion so that elements that are entering or leaving will populate those Arrays properly.
        this.interrupted || (this.interrupted = !!timelines.length);
    }
    updateVisibility() {
        this.elementStates.forEach((es)=>{
            let b = es.element.getBoundingClientRect();
            es.isVisible = !!(b.width || b.height || b.top || b.left);
            es.uncache = 1;
        });
    }
    getElementState(element) {
        return this.elementStates[this.targets.indexOf(_getEl(element))];
    }
    makeAbsolute() {
        return _orderByDOMDepth(this.elementStates.slice(0), true, true).map(_makeAbsolute);
    }
}
class ElementState {
    constructor(element, props, simple){
        if (element instanceof ElementState) {
            Object.assign(this, element, props || {});
        } else {
            this.element = element;
            this.update(props, simple);
        }
    }
    isDifferent(state) {
        let b1 = this.bounds, b2 = state.bounds;
        return b1.top !== b2.top || b1.left !== b2.left || b1.width !== b2.width || b1.height !== b2.height || !this.matrix.equals(state.matrix) || this.opacity !== state.opacity || this.props && state.props && JSON.stringify(this.props) !== JSON.stringify(state.props);
    }
    clone(overrides) {
        return new ElementState(this, overrides);
    }
    update(props, simple) {
        let self = this, element = self.element, getProp = gsap.getProperty(element), cache = gsap.core.getCache(element), bounds = element.getBoundingClientRect(), bbox = element.getBBox && typeof element.getBBox === "function" && element.nodeName.toLowerCase() !== "svg" && element.getBBox(), m = simple ? new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Matrix2D"](1, 0, 0, 1, bounds.left + (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getDocScrollLeft"])(), bounds.top + (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getDocScrollTop"])()) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(element, false, false, true);
        cache.uncache = 1; // in case there are CSS rules that affect the element. Example: https://gsap.com/community/forums/topic/44321-bug-on-fixed-position-using-flip/
        self.getProp = getProp;
        self.element = element;
        self.id = _getID(element);
        self.matrix = m;
        self.cache = cache;
        self.bounds = bounds;
        self.isVisible = !!(bounds.width || bounds.height || bounds.left || bounds.top);
        self.display = getProp("display");
        self.position = getProp("position");
        self.parent = element.parentNode;
        self.x = getProp("x", "px");
        self.y = getProp("y", "px");
        self.scaleX = cache.scaleX;
        self.scaleY = cache.scaleY;
        self.rotation = getProp("rotation");
        self.skewX = getProp("skewX");
        self.opacity = getProp("opacity");
        self.width = bbox ? bbox.width : _closestTenth(getProp("width", "px"), 0.04); // round up to the closest 0.1 so that text doesn't wrap.
        self.height = bbox ? bbox.height : _closestTenth(getProp("height", "px"), 0.04);
        props && _recordProps(self, _memoizedProps[props] || _memoizeProps(props));
        self.ctm = element.getCTM && element.nodeName.toLowerCase() === "svg" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_getCTM"])(element).inverse();
        self.simple = simple || _round(m.a) === 1 && !_round(m.b) && !_round(m.c) && _round(m.d) === 1; // allows us to speed through some other tasks if it's not scale/rotated
        self.uncache = 0;
    }
}
class FlipAction {
    constructor(vars, batch){
        this.vars = vars;
        this.batch = batch;
        this.states = [];
        this.timeline = batch.timeline;
    }
    getStateById(id) {
        let i = this.states.length;
        while(i--){
            if (this.states[i].idLookup[id]) {
                return this.states[i];
            }
        }
    }
    kill() {
        this.batch.remove(this);
    }
}
class FlipBatch {
    constructor(id){
        this.id = id;
        this.actions = [];
        this._kill = [];
        this._final = [];
        this._abs = [];
        this._run = [];
        this.data = {};
        this.state = new FlipState();
        this.timeline = gsap.timeline();
    }
    add(config) {
        let result = this.actions.filter((action)=>action.vars === config);
        if (result.length) {
            return result[0];
        }
        result = new FlipAction(typeof config === "function" ? {
            animate: config
        } : config, this);
        this.actions.push(result);
        return result;
    }
    remove(action) {
        let i = this.actions.indexOf(action);
        i >= 0 && this.actions.splice(i, 1);
        return this;
    }
    getState(merge) {
        let prevBatch = _batch, prevAction = _batchAction;
        _batch = this;
        this.state.clear();
        this._kill.length = 0;
        this.actions.forEach((action)=>{
            if (action.vars.getState) {
                action.states.length = 0;
                _batchAction = action;
                action.state = action.vars.getState(action);
            }
            merge && action.states.forEach((s)=>this.state.add(s));
        });
        _batchAction = prevAction;
        _batch = prevBatch;
        this.killConflicts();
        return this;
    }
    animate() {
        let prevBatch = _batch, tl = this.timeline, i = this.actions.length, finalStates, endTime;
        _batch = this;
        tl.clear();
        this._abs.length = this._final.length = this._run.length = 0;
        this.actions.forEach((a)=>{
            a.vars.animate && a.vars.animate(a);
            let onEnter = a.vars.onEnter, onLeave = a.vars.onLeave, targets = a.targets, s, result;
            if (targets && targets.length && (onEnter || onLeave)) {
                s = new FlipState();
                a.states.forEach((state)=>s.add(state));
                result = s.compare(Flip.getState(targets));
                result.enter.length && onEnter && onEnter(result.enter);
                result.leave.length && onLeave && onLeave(result.leave);
            }
        });
        _makeCompsAbsolute(this._abs);
        this._run.forEach((f)=>f());
        endTime = tl.duration();
        finalStates = this._final.slice(0);
        tl.add(()=>{
            if (endTime <= tl.time()) {
                finalStates.forEach((f)=>f());
                _forEachBatch(this, "onComplete");
            }
        });
        _batch = prevBatch;
        while(i--){
            this.actions[i].vars.once && this.actions[i].kill();
        }
        _forEachBatch(this, "onStart");
        tl.restart();
        return this;
    }
    loadState(done) {
        done || (done = ()=>0);
        let queue = [];
        this.actions.forEach((c)=>{
            if (c.vars.loadState) {
                let i, f = (targets)=>{
                    targets && (c.targets = targets);
                    i = queue.indexOf(f);
                    if (~i) {
                        queue.splice(i, 1);
                        queue.length || done();
                    }
                };
                queue.push(f);
                c.vars.loadState(f);
            }
        });
        queue.length || done();
        return this;
    }
    setState() {
        this.actions.forEach((c)=>c.targets = c.vars.setState && c.vars.setState(c));
        return this;
    }
    killConflicts(soft) {
        this.state.interrupt(soft);
        this._kill.forEach((state)=>state.interrupt(soft));
        return this;
    }
    run(skipGetState, merge) {
        if (this !== _batch) {
            skipGetState || this.getState(merge);
            this.loadState(()=>{
                if (!this._killed) {
                    this.setState();
                    this.animate();
                }
            });
        }
        return this;
    }
    clear(stateOnly) {
        this.state.clear();
        stateOnly || (this.actions.length = 0);
    }
    getStateById(id) {
        let i = this.actions.length, s;
        while(i--){
            s = this.actions[i].getStateById(id);
            if (s) {
                return s;
            }
        }
        return this.state.idLookup[id] && this.state;
    }
    kill() {
        this._killed = 1;
        this.clear();
        delete _batchLookup[this.id];
    }
}
class Flip {
    static getState(targets, vars) {
        let state = _parseState(targets, vars);
        _batchAction && _batchAction.states.push(state);
        vars && vars.batch && Flip.batch(vars.batch).state.add(state);
        return state;
    }
    static from(state, vars) {
        vars = vars || {};
        "clearProps" in vars || (vars.clearProps = true);
        return _fromTo(state, _parseState(vars.targets || state.targets, {
            props: vars.props || state.props,
            simple: vars.simple,
            kill: !!vars.kill
        }), vars, -1);
    }
    static to(state, vars) {
        return _fromTo(state, _parseState(vars.targets || state.targets, {
            props: vars.props || state.props,
            simple: vars.simple,
            kill: !!vars.kill
        }), vars, 1);
    }
    static fromTo(fromState, toState, vars) {
        return _fromTo(fromState, toState, vars);
    }
    static fit(fromEl, toEl, vars) {
        let v = vars ? _copy(vars, _fitReserved) : {}, { absolute, scale, getVars, props, runBackwards, onComplete, simple } = vars || v, fitChild = vars && vars.fitChild && _getEl(vars.fitChild), before = _parseElementState(toEl, props, simple, fromEl), after = _parseElementState(fromEl, 0, simple, before), inlineProps = props ? _memoizedRemoveProps[props] : _removeProps, ctx = gsap.context();
        props && _applyProps(v, before.props);
        _recordInlineStyles(after, inlineProps);
        if (runBackwards) {
            "immediateRender" in v || (v.immediateRender = true);
            v.onComplete = function() {
                _applyInlineStyles(after);
                onComplete && onComplete.apply(this, arguments);
            };
        }
        absolute && _makeAbsolute(after, before);
        v = _fit(after, before, scale || fitChild, !v.duration && props, fitChild, v.duration || getVars ? v : 0);
        typeof vars === "object" && "zIndex" in vars && (v.zIndex = vars.zIndex);
        ctx && !getVars && ctx.add(()=>()=>_applyInlineStyles(after));
        return getVars ? v : v.duration ? gsap.to(after.element, v) : null;
    }
    static makeAbsolute(targetsOrStates, vars) {
        return (targetsOrStates instanceof FlipState ? targetsOrStates : new FlipState(targetsOrStates, vars)).makeAbsolute();
    }
    static batch(id) {
        id || (id = "default");
        return _batchLookup[id] || (_batchLookup[id] = new FlipBatch(id));
    }
    static killFlipsOf(targets, complete) {
        (targets instanceof FlipState ? targets.targets : _toArray(targets)).forEach((t)=>t && _killFlip(t._flip, complete !== false ? 1 : 2));
    }
    static isFlipping(target) {
        let f = Flip.getByTarget(target);
        return !!f && f.isActive();
    }
    static getByTarget(target) {
        return (_getEl(target) || _emptyObj)._flip;
    }
    static getElementState(target, props) {
        return new ElementState(_getEl(target), props);
    }
    static convertCoordinates(fromElement, toElement, point) {
        let m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(toElement, true, true).multiply((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(fromElement));
        return point ? m.apply(point) : m;
    }
    static register(core) {
        _body = typeof document !== "undefined" && document.body;
        if (_body) {
            gsap = core;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["_setDoc"])(_body);
            _toArray = gsap.utils.toArray;
            _getStyleSaver = gsap.core.getStyleSaver;
            let snap = gsap.utils.snap(0.1);
            _closestTenth = (value, add)=>snap(parseFloat(value) + add);
        }
    }
}
Flip.version = "3.15.0";
// function whenImagesLoad(el, func) {
// 	let pending = [],
// 		onLoad = e => {
// 			pending.splice(pending.indexOf(e.target), 1);
// 			e.target.removeEventListener("load", onLoad);
// 			pending.length || func();
// 		};
// 	gsap.utils.toArray(el.tagName.toLowerCase() === "img" ? el : el.querySelectorAll("img")).forEach(img => img.complete || img.addEventListener("load", onLoad) || pending.push(img));
// 	pending.length || func();
// }
("TURBOPACK compile-time value", "undefined") !== "undefined" && window.gsap && window.gsap.registerPlugin(Flip);
;
}),
"[project]/apps/web/src/lib/gsap/src/utils/strings.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "emojiExp",
    ()=>emojiExp,
    "emojiSafeSplit",
    ()=>emojiSafeSplit,
    "getText",
    ()=>getText,
    "splitInnerHTML",
    ()=>splitInnerHTML
]);
/*!
 * strings: 3.15.0
 * https://gsap.com
 *
 * Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ let _trimExp = /(?:^\s+|\s+$)/g;
const emojiExp = /([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2642\u2640]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDD27\uDCBC\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCC\uDFCB]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;
function getText(e) {
    let type = e.nodeType, result = "";
    if (type === 1 || type === 9 || type === 11) {
        if (typeof e.textContent === "string") {
            return e.textContent;
        } else {
            for(e = e.firstChild; e; e = e.nextSibling){
                result += getText(e);
            }
        }
    } else if (type === 3 || type === 4) {
        return e.nodeValue;
    }
    return result;
}
function splitInnerHTML(element, delimiter, trim, preserveSpaces, unescapedCharCodes) {
    let node = element.firstChild, result = [], s;
    while(node){
        if (node.nodeType === 3) {
            s = (node.nodeValue + "").replace(/^\n+/g, "");
            if (!preserveSpaces) {
                s = s.replace(/\s+/g, " ");
            }
            result.push(...emojiSafeSplit(s, delimiter, trim, preserveSpaces, unescapedCharCodes));
        } else if ((node.nodeName + "").toLowerCase() === "br") {
            result[result.length - 1] += "<br>";
        } else {
            result.push(node.outerHTML);
        }
        node = node.nextSibling;
    }
    if (!unescapedCharCodes) {
        s = result.length;
        while(s--){
            result[s] === "&" && result.splice(s, 1, "&amp;");
        }
    }
    return result;
}
function emojiSafeSplit(text, delimiter, trim, preserveSpaces, unescapedCharCodes) {
    text += ""; // make sure it's cast as a string. Someone may pass in a number.
    trim && (text = text.trim ? text.trim() : text.replace(_trimExp, "")); // IE9 and earlier compatibility
    if (delimiter && delimiter !== "") {
        return text.replace(/>/g, "&gt;").replace(/</g, "&lt;").split(delimiter);
    }
    let result = [], l = text.length, i = 0, j, character;
    for(; i < l; i++){
        character = text.charAt(i);
        if (character.charCodeAt(0) >= 0xD800 && character.charCodeAt(0) <= 0xDBFF || text.charCodeAt(i + 1) >= 0xFE00 && text.charCodeAt(i + 1) <= 0xFE0F) {
            j = ((text.substr(i, 12).split(emojiExp) || [])[1] || "").length || 2;
            character = text.substr(i, j);
            result.emoji = 1;
            i += j - 1;
        }
        result.push(unescapedCharCodes ? character : character === ">" ? "&gt;" : character === "<" ? "&lt;" : preserveSpaces && character === " " && (text.charAt(i - 1) === " " || text.charAt(i + 1) === " ") ? "&nbsp;" : character);
    }
    return result;
}
}),
"[project]/apps/web/src/lib/gsap/src/TextPlugin.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TextPlugin",
    ()=>TextPlugin,
    "default",
    ()=>TextPlugin
]);
/*!
 * TextPlugin 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/strings.js [app-ssr] (ecmascript)");
;
let gsap, _tempDiv, _getGSAP = ()=>gsap || ("TURBOPACK compile-time value", "undefined") !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap;
const TextPlugin = {
    version: "3.15.0",
    name: "text",
    init (target, value, tween) {
        typeof value !== "object" && (value = {
            value: value
        });
        let i = target.nodeName.toUpperCase(), data = this, { newClass, oldClass, preserveSpaces, rtl } = value, delimiter = data.delimiter = value.delimiter || "", fillChar = data.fillChar = value.fillChar || (value.padSpace ? "&nbsp;" : ""), short, text, original, j, condensedText, condensedOriginal, aggregate, s;
        data.svg = target.getBBox && (i === "TEXT" || i === "TSPAN");
        if (!("innerHTML" in target) && !data.svg) {
            return false;
        }
        data.target = target;
        if (!("value" in value)) {
            data.text = data.original = [
                ""
            ];
            return;
        }
        original = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["splitInnerHTML"])(target, delimiter, false, preserveSpaces, data.svg);
        _tempDiv || (_tempDiv = document.createElement("div"));
        _tempDiv.innerHTML = value.value;
        text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["splitInnerHTML"])(_tempDiv, delimiter, false, preserveSpaces, data.svg);
        data.from = tween._from;
        if ((data.from || rtl) && !(rtl && data.from)) {
            i = original;
            original = text;
            text = i;
        }
        data.hasClass = !!(newClass || oldClass);
        data.newClass = rtl ? oldClass : newClass;
        data.oldClass = rtl ? newClass : oldClass;
        i = original.length - text.length;
        short = i < 0 ? original : text;
        if (i < 0) {
            i = -i;
        }
        while(--i > -1){
            short.push(fillChar);
        }
        if (value.type === "diff") {
            j = 0;
            condensedText = [];
            condensedOriginal = [];
            aggregate = "";
            for(i = 0; i < text.length; i++){
                s = text[i];
                if (s === original[i]) {
                    aggregate += s;
                } else {
                    condensedText[j] = aggregate + s;
                    condensedOriginal[j++] = aggregate + original[i];
                    aggregate = "";
                }
            }
            text = condensedText;
            original = condensedOriginal;
            if (aggregate) {
                text.push(aggregate);
                original.push(aggregate);
            }
        }
        value.speed && tween.duration(Math.min(0.05 / value.speed * short.length, value.maxDuration || 9999));
        data.rtl = rtl;
        data.original = original;
        data.text = text;
        data._props.push("text");
    },
    render (ratio, data) {
        if (ratio > 1) {
            ratio = 1;
        } else if (ratio < 0) {
            ratio = 0;
        }
        if (data.from) {
            ratio = 1 - ratio;
        }
        let { text, hasClass, newClass, oldClass, delimiter, target, fillChar, original, rtl } = data, l = text.length, i = (rtl ? 1 - ratio : ratio) * l + 0.5 | 0, applyNew, applyOld, str;
        if (hasClass && ratio) {
            applyNew = newClass && i;
            applyOld = oldClass && i !== l;
            str = (applyNew ? "<span class='" + newClass + "'>" : "") + text.slice(0, i).join(delimiter) + (applyNew ? "</span>" : "") + (applyOld ? "<span class='" + oldClass + "'>" : "") + delimiter + original.slice(i).join(delimiter) + (applyOld ? "</span>" : "");
        } else {
            str = text.slice(0, i).join(delimiter) + delimiter + original.slice(i).join(delimiter);
        }
        if (data.svg) {
            target.textContent = str;
        } else {
            target.innerHTML = fillChar === "&nbsp;" && ~str.indexOf("  ") ? str.split("  ").join("&nbsp;&nbsp;") : str;
        }
    }
};
TextPlugin.splitInnerHTML = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["splitInnerHTML"];
TextPlugin.emojiSafeSplit = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"];
TextPlugin.getText = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getText"];
_getGSAP() && gsap.registerPlugin(TextPlugin);
;
}),
"[project]/apps/web/src/lib/gsap/src/utils/paths.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bezierToPoints",
    ()=>bezierToPoints,
    "cacheRawPathMeasurements",
    ()=>cacheRawPathMeasurements,
    "convertToPath",
    ()=>convertToPath,
    "copyRawPath",
    ()=>copyRawPath,
    "flatPointsToSegment",
    ()=>flatPointsToSegment,
    "getClosestData",
    ()=>getClosestData,
    "getPositionOnPath",
    ()=>getPositionOnPath,
    "getRawPath",
    ()=>getRawPath,
    "getRotationAtProgress",
    ()=>getRotationAtProgress,
    "pointsToSegment",
    ()=>pointsToSegment,
    "rawPathToString",
    ()=>rawPathToString,
    "reverseSegment",
    ()=>reverseSegment,
    "segmentToDistributedPoints",
    ()=>segmentToDistributedPoints,
    "simplifyPoints",
    ()=>simplifyPoints,
    "sliceRawPath",
    ()=>sliceRawPath,
    "stringToRawPath",
    ()=>stringToRawPath,
    "subdivideSegment",
    ()=>subdivideSegment,
    "subdivideSegmentNear",
    ()=>subdivideSegmentNear,
    "transformRawPath",
    ()=>transformRawPath
]);
/*!
 * paths 3.15.0
 * https://gsap.com
 *
 * Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ let _svgPathExp = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig, _numbersExp = /(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig, _scientific = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/ig, _selectorExp = /(^[#\.][a-z]|[a-y][a-z])/i, _DEG2RAD = Math.PI / 180, _RAD2DEG = 180 / Math.PI, _sin = Math.sin, _cos = Math.cos, _abs = Math.abs, _sqrt = Math.sqrt, _atan2 = Math.atan2, _largeNum = 1e8, _isString = (value)=>typeof value === "string", _isNumber = (value)=>typeof value === "number", _isUndefined = (value)=>typeof value === "undefined", _temp = {}, _temp2 = {}, _roundingNum = 1e5, _wrapProgress = (progress)=>Math.round((progress + _largeNum) % 1 * _roundingNum) / _roundingNum || (progress < 0 ? 0 : 1), _round = (value)=>Math.round(value * _roundingNum) / _roundingNum || 0, _roundPrecise = (value)=>Math.round(value * 1e10) / 1e10 || 0, _segmentIsClosed = (segment)=>segment.closed = Math.abs(segment[0] - segment[segment.length - 2]) < 0.001 && Math.abs(segment[1] - segment[segment.length - 1]) < 0.001, _splitSegment = (rawPath, segIndex, i, t)=>{
    let segment = rawPath[segIndex], shift = t === 1 ? 6 : subdivideSegment(segment, i, t);
    if ((shift || !t) && shift + i + 2 < segment.length) {
        rawPath.splice(segIndex, 0, segment.slice(0, i + shift + 2));
        segment.splice(0, i + shift);
        return 1;
    }
}, _getSampleIndex = (samples, length, progress)=>{
    // slightly slower way than doing this (when there's no lookup): segment.lookup[progress < 1 ? ~~(length / segment.minLength) : segment.lookup.length - 1] || 0;
    let l = samples.length, i = ~~(progress * l);
    if (samples[i] > length) {
        while(--i && samples[i] > length){}
        i < 0 && (i = 0);
    } else {
        while(samples[++i] < length && i < l){}
    }
    return i < l ? i : l - 1;
}, _reverseRawPath = (rawPath, skipOuter)=>{
    let i = rawPath.length;
    skipOuter || rawPath.reverse();
    while(i--){
        rawPath[i].reversed || reverseSegment(rawPath[i]);
    }
}, _copyMetaData = (source, copy)=>{
    copy.totalLength = source.totalLength;
    if (source.samples) {
        copy.samples = source.samples.slice(0);
        copy.lookup = source.lookup.slice(0);
        copy.minLength = source.minLength;
        copy.resolution = source.resolution;
    } else if (source.totalPoints) {
        copy.totalPoints = source.totalPoints;
    }
    return copy;
}, //pushes a new segment into a rawPath, but if its starting values match the ending values of the last segment, it'll merge it into that same segment (to reduce the number of segments)
_appendOrMerge = (rawPath, segment)=>{
    let index = rawPath.length, prevSeg = rawPath[index - 1] || [], l = prevSeg.length;
    if (index && segment[0] === prevSeg[l - 2] && segment[1] === prevSeg[l - 1]) {
        segment = prevSeg.concat(segment.slice(2));
        index--;
    }
    rawPath[index] = segment;
}, _bestDistance;
function getRawPath(value) {
    value = _isString(value) && _selectorExp.test(value) ? document.querySelector(value) || value : value;
    let e = value.getAttribute ? value : 0, rawPath;
    if (e && (value = value.getAttribute("d"))) {
        //implements caching
        if (!e._gsPath) {
            e._gsPath = {};
        }
        rawPath = e._gsPath[value];
        return rawPath && !rawPath._dirty ? rawPath : e._gsPath[value] = stringToRawPath(value);
    }
    return !value ? console.warn("Expecting a <path> element or an SVG path data string") : _isString(value) ? stringToRawPath(value) : _isNumber(value[0]) ? [
        value
    ] : value;
}
function copyRawPath(rawPath) {
    let a = [], i = 0;
    for(; i < rawPath.length; i++){
        a[i] = _copyMetaData(rawPath[i], rawPath[i].slice(0));
    }
    return _copyMetaData(rawPath, a);
}
function reverseSegment(segment) {
    let i = 0, y;
    segment.reverse(); //this will invert the order y, x, y, x so we must flip it back.
    for(; i < segment.length; i += 2){
        y = segment[i];
        segment[i] = segment[i + 1];
        segment[i + 1] = y;
    }
    segment.reversed = !segment.reversed;
}
let _createPath = (e, ignore)=>{
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path"), attr = [].slice.call(e.attributes), i = attr.length, name;
    ignore = "," + ignore + ",";
    while(--i > -1){
        name = attr[i].nodeName.toLowerCase(); //in Microsoft Edge, if you don't set the attribute with a lowercase name, it doesn't render correctly! Super weird.
        if (ignore.indexOf("," + name + ",") < 0) {
            path.setAttributeNS(null, name, attr[i].nodeValue);
        }
    }
    return path;
}, _typeAttrs = {
    rect: "rx,ry,x,y,width,height",
    circle: "r,cx,cy",
    ellipse: "rx,ry,cx,cy",
    line: "x1,x2,y1,y2"
}, _attrToObj = (e, attrs)=>{
    let props = attrs ? attrs.split(",") : [], obj = {}, i = props.length;
    while(--i > -1){
        obj[props[i]] = +e.getAttribute(props[i]) || 0;
    }
    return obj;
};
function convertToPath(element, swap) {
    let type = element.tagName.toLowerCase(), circ = 0.552284749831, data, x, y, r, ry, path, rcirc, rycirc, points, w, h, x2, x3, x4, x5, x6, y2, y3, y4, y5, y6, attr;
    if (type === "path" || !element.getBBox) {
        return element;
    }
    path = _createPath(element, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points");
    attr = _attrToObj(element, _typeAttrs[type]);
    if (type === "rect") {
        r = attr.rx;
        ry = attr.ry || r;
        x = attr.x;
        y = attr.y;
        w = attr.width - r * 2;
        h = attr.height - ry * 2;
        if (r || ry) {
            x2 = x + r * (1 - circ);
            x3 = x + r;
            x4 = x3 + w;
            x5 = x4 + r * circ;
            x6 = x4 + r;
            y2 = y + ry * (1 - circ);
            y3 = y + ry;
            y4 = y3 + h;
            y5 = y4 + ry * circ;
            y6 = y4 + ry;
            data = "M" + x6 + "," + y3 + " V" + y4 + " C" + [
                x6,
                y5,
                x5,
                y6,
                x4,
                y6,
                x4 - (x4 - x3) / 3,
                y6,
                x3 + (x4 - x3) / 3,
                y6,
                x3,
                y6,
                x2,
                y6,
                x,
                y5,
                x,
                y4,
                x,
                y4 - (y4 - y3) / 3,
                x,
                y3 + (y4 - y3) / 3,
                x,
                y3,
                x,
                y2,
                x2,
                y,
                x3,
                y,
                x3 + (x4 - x3) / 3,
                y,
                x4 - (x4 - x3) / 3,
                y,
                x4,
                y,
                x5,
                y,
                x6,
                y2,
                x6,
                y3
            ].join(",") + "z";
        } else {
            data = "M" + (x + w) + "," + y + " v" + h + " h" + -w + " v" + -h + " h" + w + "z";
        }
    } else if (type === "circle" || type === "ellipse") {
        if (type === "circle") {
            r = ry = attr.r;
            rycirc = r * circ;
        } else {
            r = attr.rx;
            ry = attr.ry;
            rycirc = ry * circ;
        }
        x = attr.cx;
        y = attr.cy;
        rcirc = r * circ;
        data = "M" + (x + r) + "," + y + " C" + [
            x + r,
            y + rycirc,
            x + rcirc,
            y + ry,
            x,
            y + ry,
            x - rcirc,
            y + ry,
            x - r,
            y + rycirc,
            x - r,
            y,
            x - r,
            y - rycirc,
            x - rcirc,
            y - ry,
            x,
            y - ry,
            x + rcirc,
            y - ry,
            x + r,
            y - rycirc,
            x + r,
            y
        ].join(",") + "z";
    } else if (type === "line") {
        data = "M" + attr.x1 + "," + attr.y1 + " L" + attr.x2 + "," + attr.y2; //previously, we just converted to "Mx,y Lx,y" but Safari has bugs that cause that not to render properly when using a stroke-dasharray that's not fully visible! Using a cubic bezier fixes that issue.
    } else if (type === "polyline" || type === "polygon") {
        points = (element.getAttribute("points") + "").match(_numbersExp) || [];
        x = points.shift();
        y = points.shift();
        data = "M" + x + "," + y + " L" + points.join(",");
        if (type === "polygon") {
            data += "," + x + "," + y + "z";
        }
    }
    path.setAttribute("d", rawPathToString(path._gsRawPath = stringToRawPath(data)));
    if (swap && element.parentNode) {
        element.parentNode.insertBefore(path, element);
        element.parentNode.removeChild(element);
    }
    return path;
}
function getRotationAtProgress(rawPath, progress) {
    let d = getProgressData(rawPath, progress >= 1 ? 1 - 1e-9 : progress ? progress : 1e-9);
    return getRotationAtBezierT(d.segment, d.i, d.t);
}
function getRotationAtBezierT(segment, i, t) {
    let a = segment[i], b = segment[i + 2], c = segment[i + 4], x;
    a += (b - a) * t;
    b += (c - b) * t;
    a += (b - a) * t;
    x = b + (c + (segment[i + 6] - c) * t - b) * t - a;
    a = segment[i + 1];
    b = segment[i + 3];
    c = segment[i + 5];
    a += (b - a) * t;
    b += (c - b) * t;
    a += (b - a) * t;
    return _round(_atan2(b + (c + (segment[i + 7] - c) * t - b) * t - a, x) * _RAD2DEG);
}
function sliceRawPath(rawPath, start, end) {
    end = _isUndefined(end) ? 1 : _roundPrecise(end) || 0; // we must round to avoid issues like 4.15 / 8 = 0.8300000000000001 instead of 0.83 or 2.8 / 5 = 0.5599999999999999 instead of 0.56 and if someone is doing a loop like start: 2.8 / 0.5, end: 2.8 / 0.5 + 1.
    start = _roundPrecise(start) || 0;
    let loops = Math.max(0, ~~(_abs(end - start) - 1e-8)), path = copyRawPath(rawPath);
    if (start > end) {
        start = 1 - start;
        end = 1 - end;
        _reverseRawPath(path);
        path.totalLength = 0;
    }
    if (start < 0 || end < 0) {
        let offset = Math.abs(~~Math.min(start, end)) + 1;
        start += offset;
        end += offset;
    }
    path.totalLength || cacheRawPathMeasurements(path);
    let wrap = end > 1, s = getProgressData(path, start, _temp, true), e = getProgressData(path, end, _temp2), eSeg = e.segment, sSeg = s.segment, eSegIndex = e.segIndex, sSegIndex = s.segIndex, ei = e.i, si = s.i, sameSegment = sSegIndex === eSegIndex, sameBezier = ei === si && sameSegment, wrapsBehind, sShift, eShift, i, copy, totalSegments, l, j;
    if (wrap || loops) {
        wrapsBehind = eSegIndex < sSegIndex || sameSegment && ei < si || sameBezier && e.t < s.t;
        if (_splitSegment(path, sSegIndex, si, s.t)) {
            sSegIndex++;
            if (!wrapsBehind) {
                eSegIndex++;
                if (sameBezier) {
                    e.t = (e.t - s.t) / (1 - s.t);
                    ei = 0;
                } else if (sameSegment) {
                    ei -= si;
                }
            }
        }
        if (Math.abs(1 - (end - start)) < 1e-5) {
            eSegIndex = sSegIndex - 1;
        } else if (!e.t && eSegIndex) {
            eSegIndex--;
        } else if (_splitSegment(path, eSegIndex, ei, e.t) && wrapsBehind) {
            sSegIndex++;
        }
        if (s.t === 1) {
            sSegIndex = (sSegIndex + 1) % path.length;
        }
        copy = [];
        totalSegments = path.length;
        l = 1 + totalSegments * loops;
        j = sSegIndex;
        l += (totalSegments - sSegIndex + eSegIndex) % totalSegments;
        for(i = 0; i < l; i++){
            _appendOrMerge(copy, path[j++ % totalSegments]);
        }
        path = copy;
    } else {
        eShift = e.t === 1 ? 6 : subdivideSegment(eSeg, ei, e.t);
        if (start !== end) {
            sShift = subdivideSegment(sSeg, si, sameBezier ? s.t / e.t : s.t);
            sameSegment && (eShift += sShift);
            eSeg.splice(ei + eShift + 2);
            (sShift || si) && sSeg.splice(0, si + sShift);
            i = path.length;
            while(i--){
                //chop off any extra segments
                (i < sSegIndex || i > eSegIndex) && path.splice(i, 1);
            }
        } else {
            eSeg.angle = getRotationAtBezierT(eSeg, ei + eShift, 0); //record the value before we chop because it'll be impossible to determine the angle after its length is 0!
            ei += eShift;
            s = eSeg[ei];
            e = eSeg[ei + 1];
            eSeg.length = eSeg.totalLength = 0;
            eSeg.totalPoints = path.totalPoints = 8;
            eSeg.push(s, e, s, e, s, e, s, e);
        }
    }
    path.totalLength = 0;
    return path;
}
//measures a Segment according to its resolution (so if segment.resolution is 6, for example, it'll take 6 samples equally across each Bezier) and create/populate a "samples" Array that has the length up to each of those sample points (always increasing from the start) as well as a "lookup" array that's broken up according to the smallest distance between 2 samples. This gives us a very fast way of looking up a progress position rather than looping through all the points/Beziers. You can optionally have it only measure a subset, starting at startIndex and going for a specific number of beziers (remember, there are 3 x/y pairs each, for a total of 6 elements for each Bezier). It will also populate a "totalLength" property, but that's not generally super accurate because by default it'll only take 6 samples per Bezier. But for performance reasons, it's perfectly adequate for measuring progress values along the path. If you need a more accurate totalLength, either increase the resolution or use the more advanced bezierToPoints() method which keeps adding points until they don't deviate by more than a certain precision value.
function measureSegment(segment, startIndex, bezierQty) {
    startIndex = startIndex || 0;
    if (!segment.samples) {
        segment.samples = [];
        segment.lookup = [];
    }
    let resolution = ~~segment.resolution || 12, inc = 1 / resolution, endIndex = bezierQty ? startIndex + bezierQty * 6 + 1 : segment.length, x1 = segment[startIndex], y1 = segment[startIndex + 1], samplesIndex = startIndex ? startIndex / 6 * resolution : 0, samples = segment.samples, lookup = segment.lookup, min = (startIndex ? segment.minLength : _largeNum) || _largeNum, prevLength = samples[samplesIndex + bezierQty * resolution - 1], length = startIndex ? samples[samplesIndex - 1] : 0, i, j, x4, x3, x2, xd, xd1, y4, y3, y2, yd, yd1, inv, t, lengthIndex, l, segLength;
    samples.length = lookup.length = 0;
    for(j = startIndex + 2; j < endIndex; j += 6){
        x4 = segment[j + 4] - x1;
        x3 = segment[j + 2] - x1;
        x2 = segment[j] - x1;
        y4 = segment[j + 5] - y1;
        y3 = segment[j + 3] - y1;
        y2 = segment[j + 1] - y1;
        xd = xd1 = yd = yd1 = 0;
        if (_abs(x4) < .01 && _abs(y4) < .01 && _abs(x2) + _abs(y2) < .01) {
            if (segment.length > 8) {
                segment.splice(j, 6);
                j -= 6;
                endIndex -= 6;
            }
        } else {
            for(i = 1; i <= resolution; i++){
                t = inc * i;
                inv = 1 - t;
                xd = xd1 - (xd1 = (t * t * x4 + 3 * inv * (t * x3 + inv * x2)) * t);
                yd = yd1 - (yd1 = (t * t * y4 + 3 * inv * (t * y3 + inv * y2)) * t);
                l = _sqrt(yd * yd + xd * xd);
                if (l < min) {
                    min = l;
                }
                length += l;
                samples[samplesIndex++] = length;
            }
        }
        x1 += x4;
        y1 += y4;
    }
    if (prevLength) {
        prevLength -= length;
        for(; samplesIndex < samples.length; samplesIndex++){
            samples[samplesIndex] += prevLength;
        }
    }
    if (samples.length && min) {
        segment.totalLength = segLength = samples[samples.length - 1] || 0;
        segment.minLength = min;
        if (segLength / min < 9999) {
            l = lengthIndex = 0;
            for(i = 0; i < segLength; i += min){
                lookup[l++] = samples[lengthIndex] < i ? ++lengthIndex : lengthIndex;
            }
        }
    } else {
        segment.totalLength = samples[0] = 0;
    }
    return startIndex ? length - samples[startIndex / 2 - 1] : length;
}
function cacheRawPathMeasurements(rawPath, resolution) {
    let pathLength, points, i;
    for(i = pathLength = points = 0; i < rawPath.length; i++){
        rawPath[i].resolution = ~~resolution || 12; //steps per Bezier curve (anchor, 2 control points, to anchor)
        pathLength += measureSegment(rawPath[i]); // note: measureSegment() also removes points that are basically on top of each other, so the segment.length may change!
        points += rawPath[i].length;
    }
    rawPath.totalPoints = points;
    rawPath.totalLength = pathLength;
    return rawPath;
}
function subdivideSegment(segment, i, t) {
    if (t <= 0 || t >= 1) {
        return 0;
    }
    let ax = segment[i], ay = segment[i + 1], cp1x = segment[i + 2], cp1y = segment[i + 3], cp2x = segment[i + 4], cp2y = segment[i + 5], bx = segment[i + 6], by = segment[i + 7], x1a = ax + (cp1x - ax) * t, x2 = cp1x + (cp2x - cp1x) * t, y1a = ay + (cp1y - ay) * t, y2 = cp1y + (cp2y - cp1y) * t, x1 = x1a + (x2 - x1a) * t, y1 = y1a + (y2 - y1a) * t, x2a = cp2x + (bx - cp2x) * t, y2a = cp2y + (by - cp2y) * t;
    x2 += (x2a - x2) * t;
    y2 += (y2a - y2) * t;
    segment.splice(i + 2, 4, _round(x1a), _round(y1a), _round(x1), _round(y1), _round(x1 + (x2 - x1) * t), _round(y1 + (y2 - y1) * t), _round(x2), _round(y2), _round(x2a), _round(y2a));
    segment.samples && segment.samples.splice(i / 6 * segment.resolution | 0, 0, 0, 0, 0, 0, 0, 0);
    return 6;
}
// returns an object {path, segment, segIndex, i, t}
function getProgressData(rawPath, progress, decoratee, pushToNextIfAtEnd) {
    decoratee = decoratee || {};
    rawPath.totalLength || cacheRawPathMeasurements(rawPath);
    if (progress < 0 || progress > 1) {
        progress = _wrapProgress(progress);
    }
    let segIndex = 0, segment = rawPath[0], samples, resolution, length, min, max, i, t;
    if (!progress) {
        t = i = segIndex = 0;
        segment = rawPath[0];
    } else if (progress === 1) {
        t = 1;
        segIndex = rawPath.length - 1;
        segment = rawPath[segIndex];
        i = segment.length - 8;
    } else {
        if (rawPath.length > 1) {
            length = rawPath.totalLength * progress;
            max = i = 0;
            while((max += rawPath[i++].totalLength) < length){
                segIndex = i;
            }
            segment = rawPath[segIndex];
            min = max - segment.totalLength;
            progress = (length - min) / (max - min) || 0;
        }
        samples = segment.samples;
        resolution = segment.resolution; //how many samples per cubic bezier chunk
        length = segment.totalLength * progress;
        i = segment.lookup.length ? segment.lookup[~~(length / segment.minLength)] || 0 : _getSampleIndex(samples, length, progress);
        min = i ? samples[i - 1] : 0;
        max = samples[i];
        if (max < length) {
            min = max;
            max = samples[++i];
        }
        t = 1 / resolution * ((length - min) / (max - min) + i % resolution);
        i = ~~(i / resolution) * 6;
        if (pushToNextIfAtEnd && t === 1) {
            if (i + 6 < segment.length) {
                i += 6;
                t = 0;
            } else if (segIndex + 1 < rawPath.length) {
                i = t = 0;
                segment = rawPath[++segIndex];
            }
        }
    }
    decoratee.t = t;
    decoratee.i = i;
    decoratee.path = rawPath;
    decoratee.segment = segment;
    decoratee.segIndex = segIndex;
    return decoratee;
}
function getPositionOnPath(rawPath, progress, includeAngle, point) {
    let segment = rawPath[0], result = point || {}, samples, resolution, length, min, max, i, t, a, inv;
    if (progress < 0 || progress > 1) {
        progress = _wrapProgress(progress);
    }
    segment.lookup || cacheRawPathMeasurements(rawPath);
    if (rawPath.length > 1) {
        length = rawPath.totalLength * progress;
        max = i = 0;
        while((max += rawPath[i++].totalLength) < length){
            segment = rawPath[i];
        }
        min = max - segment.totalLength;
        progress = (length - min) / (max - min) || 0;
    }
    samples = segment.samples;
    resolution = segment.resolution;
    length = segment.totalLength * progress;
    i = segment.lookup.length ? segment.lookup[progress < 1 ? ~~(length / segment.minLength) : segment.lookup.length - 1] || 0 : _getSampleIndex(samples, length, progress);
    min = i ? samples[i - 1] : 0;
    max = samples[i];
    if (max < length) {
        min = max;
        max = samples[++i];
    }
    t = 1 / resolution * ((length - min) / (max - min) + i % resolution) || 0;
    inv = 1 - t;
    i = ~~(i / resolution) * 6;
    a = segment[i];
    result.x = _round((t * t * (segment[i + 6] - a) + 3 * inv * (t * (segment[i + 4] - a) + inv * (segment[i + 2] - a))) * t + a);
    result.y = _round((t * t * (segment[i + 7] - (a = segment[i + 1])) + 3 * inv * (t * (segment[i + 5] - a) + inv * (segment[i + 3] - a))) * t + a);
    if (includeAngle) {
        result.angle = segment.totalLength ? getRotationAtBezierT(segment, i, t >= 1 ? 1 - 1e-9 : t ? t : 1e-9) : segment.angle || 0;
    }
    return result;
}
function transformRawPath(rawPath, a, b, c, d, tx, ty) {
    let j = rawPath.length, segment, l, i, x, y;
    while(--j > -1){
        segment = rawPath[j];
        l = segment.length;
        for(i = 0; i < l; i += 2){
            x = segment[i];
            y = segment[i + 1];
            segment[i] = x * a + y * c + tx;
            segment[i + 1] = x * b + y * d + ty;
        }
    }
    rawPath._dirty = 1;
    return rawPath;
}
// translates SVG arc data into a segment (cubic beziers). Angle is in degrees.
function arcToSegment(lastX, lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
    if (lastX === x && lastY === y) {
        return;
    }
    rx = _abs(rx);
    ry = _abs(ry);
    let angleRad = angle % 360 * _DEG2RAD, cosAngle = _cos(angleRad), sinAngle = _sin(angleRad), PI = Math.PI, TWOPI = PI * 2, dx2 = (lastX - x) / 2, dy2 = (lastY - y) / 2, x1 = cosAngle * dx2 + sinAngle * dy2, y1 = -sinAngle * dx2 + cosAngle * dy2, x1_sq = x1 * x1, y1_sq = y1 * y1, radiiCheck = x1_sq / (rx * rx) + y1_sq / (ry * ry);
    if (radiiCheck > 1) {
        rx = _sqrt(radiiCheck) * rx;
        ry = _sqrt(radiiCheck) * ry;
    }
    let rx_sq = rx * rx, ry_sq = ry * ry, sq = (rx_sq * ry_sq - rx_sq * y1_sq - ry_sq * x1_sq) / (rx_sq * y1_sq + ry_sq * x1_sq);
    if (sq < 0) {
        sq = 0;
    }
    let coef = (largeArcFlag === sweepFlag ? -1 : 1) * _sqrt(sq), cx1 = coef * (rx * y1 / ry), cy1 = coef * -(ry * x1 / rx), sx2 = (lastX + x) / 2, sy2 = (lastY + y) / 2, cx = sx2 + (cosAngle * cx1 - sinAngle * cy1), cy = sy2 + (sinAngle * cx1 + cosAngle * cy1), ux = (x1 - cx1) / rx, uy = (y1 - cy1) / ry, vx = (-x1 - cx1) / rx, vy = (-y1 - cy1) / ry, temp = ux * ux + uy * uy, angleStart = (uy < 0 ? -1 : 1) * Math.acos(ux / _sqrt(temp)), angleExtent = (ux * vy - uy * vx < 0 ? -1 : 1) * Math.acos((ux * vx + uy * vy) / _sqrt(temp * (vx * vx + vy * vy)));
    isNaN(angleExtent) && (angleExtent = PI); //rare edge case. Math.cos(-1) is NaN.
    if (!sweepFlag && angleExtent > 0) {
        angleExtent -= TWOPI;
    } else if (sweepFlag && angleExtent < 0) {
        angleExtent += TWOPI;
    }
    angleStart %= TWOPI;
    angleExtent %= TWOPI;
    let segments = Math.ceil(_abs(angleExtent) / (TWOPI / 4)), rawPath = [], angleIncrement = angleExtent / segments, controlLength = 4 / 3 * _sin(angleIncrement / 2) / (1 + _cos(angleIncrement / 2)), ma = cosAngle * rx, mb = sinAngle * rx, mc = sinAngle * -ry, md = cosAngle * ry, i;
    for(i = 0; i < segments; i++){
        angle = angleStart + i * angleIncrement;
        x1 = _cos(angle);
        y1 = _sin(angle);
        ux = _cos(angle += angleIncrement);
        uy = _sin(angle);
        rawPath.push(x1 - controlLength * y1, y1 + controlLength * x1, ux + controlLength * uy, uy - controlLength * ux, ux, uy);
    }
    //now transform according to the actual size of the ellipse/arc (the beziers were noramlized, between 0 and 1 on a circle).
    for(i = 0; i < rawPath.length; i += 2){
        x1 = rawPath[i];
        y1 = rawPath[i + 1];
        rawPath[i] = x1 * ma + y1 * mc + cx;
        rawPath[i + 1] = x1 * mb + y1 * md + cy;
    }
    rawPath[i - 2] = x; //always set the end to exactly where it's supposed to be
    rawPath[i - 1] = y;
    return rawPath;
}
function stringToRawPath(d) {
    let a = (d + "").replace(_scientific, (m)=>{
        let n = +m;
        return n < 0.0001 && n > -0.0001 ? 0 : n;
    }).match(_svgPathExp) || [], path = [], relativeX = 0, relativeY = 0, twoThirds = 2 / 3, elements = a.length, points = 0, errorMessage = "ERROR: malformed path: " + d, i, j, x, y, command, isRelative, segment, startX, startY, difX, difY, beziers, prevCommand, flag1, flag2, line = function(sx, sy, ex, ey) {
        difX = (ex - sx) / 3;
        difY = (ey - sy) / 3;
        segment.push(sx + difX, sy + difY, ex - difX, ey - difY, ex, ey);
    };
    if (!d || !isNaN(a[0]) || isNaN(a[1])) {
        console.log(errorMessage);
        return path;
    }
    for(i = 0; i < elements; i++){
        prevCommand = command;
        if (isNaN(a[i])) {
            command = a[i].toUpperCase();
            isRelative = command !== a[i]; //lower case means relative
        } else {
            i--;
        }
        x = +a[i + 1];
        y = +a[i + 2];
        if (isRelative) {
            x += relativeX;
            y += relativeY;
        }
        if (!i) {
            startX = x;
            startY = y;
        }
        // "M" (move)
        if (command === "M") {
            if (segment) {
                if (segment.length < 8) {
                    path.length -= 1;
                } else {
                    points += segment.length;
                }
                _segmentIsClosed(segment);
            }
            relativeX = startX = x;
            relativeY = startY = y;
            segment = [
                x,
                y
            ];
            path.push(segment);
            i += 2;
            command = "L"; //an "M" with more than 2 values gets interpreted as "lineTo" commands ("L").
        // "C" (cubic bezier)
        } else if (command === "C") {
            if (!segment) {
                segment = [
                    0,
                    0
                ];
            }
            if (!isRelative) {
                relativeX = relativeY = 0;
            }
            //note: "*1" is just a fast/short way to cast the value as a Number. WAAAY faster in Chrome, slightly slower in Firefox.
            segment.push(x, y, relativeX + a[i + 3] * 1, relativeY + a[i + 4] * 1, relativeX += a[i + 5] * 1, relativeY += a[i + 6] * 1);
            i += 6;
        // "S" (continuation of cubic bezier)
        } else if (command === "S") {
            difX = relativeX;
            difY = relativeY;
            if (prevCommand === "C" || prevCommand === "S") {
                difX += relativeX - segment[segment.length - 4];
                difY += relativeY - segment[segment.length - 3];
            }
            if (!isRelative) {
                relativeX = relativeY = 0;
            }
            segment.push(difX, difY, x, y, relativeX += a[i + 3] * 1, relativeY += a[i + 4] * 1);
            i += 4;
        // "Q" (quadratic bezier)
        } else if (command === "Q") {
            difX = relativeX + (x - relativeX) * twoThirds;
            difY = relativeY + (y - relativeY) * twoThirds;
            if (!isRelative) {
                relativeX = relativeY = 0;
            }
            relativeX += a[i + 3] * 1;
            relativeY += a[i + 4] * 1;
            segment.push(difX, difY, relativeX + (x - relativeX) * twoThirds, relativeY + (y - relativeY) * twoThirds, relativeX, relativeY);
            i += 4;
        // "T" (continuation of quadratic bezier)
        } else if (command === "T") {
            difX = relativeX - segment[segment.length - 4];
            difY = relativeY - segment[segment.length - 3];
            segment.push(relativeX + difX, relativeY + difY, x + (relativeX + difX * 1.5 - x) * twoThirds, y + (relativeY + difY * 1.5 - y) * twoThirds, relativeX = x, relativeY = y);
            i += 2;
        // "H" (horizontal line)
        } else if (command === "H") {
            line(relativeX, relativeY, relativeX = x, relativeY);
            i += 1;
        // "V" (vertical line)
        } else if (command === "V") {
            //adjust values because the first (and only one) isn't x in this case, it's y.
            line(relativeX, relativeY, relativeX, relativeY = x + (isRelative ? relativeY - relativeX : 0));
            i += 1;
        // "L" (line) or "Z" (close)
        } else if (command === "L" || command === "Z") {
            if (command === "Z") {
                x = startX;
                y = startY;
                segment.closed = true;
            }
            if (command === "L" || _abs(relativeX - x) > 0.5 || _abs(relativeY - y) > 0.5) {
                line(relativeX, relativeY, x, y);
                if (command === "L") {
                    i += 2;
                }
            }
            relativeX = x;
            relativeY = y;
        // "A" (arc)
        } else if (command === "A") {
            flag1 = a[i + 4];
            flag2 = a[i + 5];
            difX = a[i + 6];
            difY = a[i + 7];
            j = 7;
            if (flag1.length > 1) {
                if (flag1.length < 3) {
                    difY = difX;
                    difX = flag2;
                    j--;
                } else {
                    difY = flag2;
                    difX = flag1.substr(2);
                    j -= 2;
                }
                flag2 = flag1.charAt(1);
                flag1 = flag1.charAt(0);
            }
            beziers = arcToSegment(relativeX, relativeY, +a[i + 1], +a[i + 2], +a[i + 3], +flag1, +flag2, (isRelative ? relativeX : 0) + difX * 1, (isRelative ? relativeY : 0) + difY * 1);
            i += j;
            if (beziers) {
                for(j = 0; j < beziers.length; j++){
                    segment.push(beziers[j]);
                }
            }
            relativeX = segment[segment.length - 2];
            relativeY = segment[segment.length - 1];
        } else {
            console.log(errorMessage);
        }
    }
    i = segment.length;
    if (i < 6) {
        path.pop();
        i = 0;
    } else {
        _segmentIsClosed(segment);
    }
    path.totalPoints = points + i;
    return path;
}
function bezierToPoints(x1, y1, x2, y2, x3, y3, x4, y4, threshold, points, index) {
    let x12 = (x1 + x2) / 2, y12 = (y1 + y2) / 2, x23 = (x2 + x3) / 2, y23 = (y2 + y3) / 2, x34 = (x3 + x4) / 2, y34 = (y3 + y4) / 2, x123 = (x12 + x23) / 2, y123 = (y12 + y23) / 2, x234 = (x23 + x34) / 2, y234 = (y23 + y34) / 2, x1234 = (x123 + x234) / 2, y1234 = (y123 + y234) / 2, dx = x4 - x1, dy = y4 - y1, d2 = _abs((x2 - x4) * dy - (y2 - y4) * dx), d3 = _abs((x3 - x4) * dy - (y3 - y4) * dx), length;
    if (!points) {
        points = [
            x1,
            y1,
            x4,
            y4
        ];
        index = 2;
    }
    points.splice(index || points.length - 2, 0, x1234, y1234);
    if ((d2 + d3) * (d2 + d3) > threshold * (dx * dx + dy * dy)) {
        length = points.length;
        bezierToPoints(x1, y1, x12, y12, x123, y123, x1234, y1234, threshold, points, index);
        bezierToPoints(x1234, y1234, x234, y234, x34, y34, x4, y4, threshold, points, index + 2 + (points.length - length));
    }
    return points;
}
function flatPointsToSegment(points, curviness = 1) {
    let x = points[0], y = 0, segment = [
        x,
        y
    ], i = 2;
    for(; i < points.length; i += 2){
        segment.push(x, y, points[i], y = (points[i] - x) * curviness / 2, x = points[i], -y);
    }
    return segment;
}
function segmentToDistributedPoints(segment, totalPoints) {
    segment.samples || measureSegment(segment);
    let { samples, lookup, resolution, totalLength } = segment, points = segment.slice(0, 2), curveStoppingPoints = [], l = segment.length - 4, i = 6, limit = 0.2, startLength = 0, curvePointsCumulative = 0, t, curvePoints, min, max, ci, ratioInc, j, inv, curveLength, length, a, nonSmooth, curveStoppingPointIndex, sampleIndex;
    // first, loop through each anchor and find out if it's smooth (curve) or not by comparing the angle to each control point (if they're within a certain range, it's smooth). We want to keep pivot points (non-smooth) anchors but allow curved/smooth ones to be subject to simplification.
    for(; i < l; i += 6){
        if (Math.abs(_atan2(segment[i + 1] - segment[i - 1], segment[i] - segment[i - 2]) - _atan2(segment[i + 3] - segment[i + 1], segment[i + 2] - segment[i])) > limit) {
            curveStoppingPoints.push(i);
        }
    }
    curveStoppingPoints.push(segment.length - 2); // the last anchor is always a curve stopping point.
    l = curveStoppingPoints.length;
    points.nonSmooth = nonSmooth = [
        1
    ]; // keep track of which points are non-smooth so that when we call pointsToSegment() we can maintain their angle.
    if (totalPoints > l) {
        totalPoints -= l;
        for(ci = 0; ci < l; ci++){
            curveStoppingPointIndex = curveStoppingPoints[ci];
            sampleIndex = Math.round(curveStoppingPointIndex / 6 * resolution);
            curveLength = samples[sampleIndex - 1] - startLength;
            curvePoints = Math.round(samples[sampleIndex - 1] / totalLength * totalPoints) - curvePointsCumulative;
            curvePointsCumulative += curvePoints;
            ratioInc = 1 / (curvePoints + 1);
            for(j = 1; j <= curvePoints; j++){
                length = startLength + curveLength * j * ratioInc;
                i = lookup.length ? lookup[length < totalLength ? ~~(length / segment.minLength) : lookup.length - 1] || 0 : _getSampleIndex(samples, length, length / totalLength);
                min = i ? samples[i - 1] : 0;
                max = samples[i];
                if (max < length) {
                    min = max;
                    max = samples[++i];
                }
                t = 1 / resolution * ((length - min) / (max - min) + i % resolution) || 0;
                inv = 1 - t;
                i = ~~(i / resolution) * 6;
                a = segment[i];
                points.push(_round((t * t * (segment[i + 6] - a) + 3 * inv * (t * (segment[i + 4] - a) + inv * (segment[i + 2] - a))) * t + a), _round((t * t * (segment[i + 7] - (a = segment[i + 1])) + 3 * inv * (t * (segment[i + 5] - a) + inv * (segment[i + 3] - a))) * t + a) // y
                );
            }
            nonSmooth[points.length] = 1;
            points.push(segment[curveStoppingPointIndex], segment[curveStoppingPointIndex + 1]);
            startLength += curveLength;
        }
    }
    // if the path is closed (the last anchor is the same as the first), check to see if it's a smooth joint. If so, update the nonSmooth Array accordingly.
    i = segment.length - 2;
    if (segment.closed && Math.abs(_atan2(segment[i + 1] - segment[i - 1], segment[i] - segment[i - 2]) - _atan2(segment[3] - segment[1], segment[2] - segment[0])) <= limit) {
        nonSmooth[0] = nonSmooth[nonSmooth.length - 1] = 0;
    }
    return points;
}
function pointsToSegment(points, curviness) {
    //points = simplifyPoints(points, tolerance);
    _abs(points[0] - points[2]) < 1e-4 && _abs(points[1] - points[3]) < 1e-4 && (points = points.slice(2)); // if the first two points are super close, dump the first one.
    let l = points.length - 2, x = +points[0], y = +points[1], nextX = +points[2], nextY = +points[3], segment = [
        x,
        y,
        x,
        y
    ], dx2 = nextX - x, dy2 = nextY - y, nonSmooth = points.nonSmooth || [], closed = Math.abs(points[l] - x) < 0.001 && Math.abs(points[l + 1] - y) < 0.001, prevX, prevY, i, dx1, dy1, r1, r2, r3, tl, mx1, mx2, mxm, my1, my2, mym;
    if (!l) {
        return [
            x,
            y,
            x,
            y,
            x,
            y,
            x,
            y
        ];
    }
    if (closed) {
        points.push(nextX, nextY);
        nextX = x;
        nextY = y;
        x = points[l - 2];
        y = points[l - 1];
        points.unshift(x, y);
        l += 4;
        nonSmooth = [
            0,
            0,
            ...nonSmooth
        ];
    }
    curviness = curviness || curviness === 0 ? +curviness : 1;
    for(i = 2; i < l; i += 2){
        prevX = x;
        prevY = y;
        x = nextX;
        y = nextY;
        nextX = +points[i + 2];
        nextY = +points[i + 3];
        if (x === nextX && y === nextY) {
            continue;
        }
        dx1 = dx2;
        dy1 = dy2;
        dx2 = nextX - x;
        dy2 = nextY - y;
        if (nonSmooth[i]) {
            segment.push(x - (x - prevX) / 4, y - (y - prevY) / 4, x, y, x + (nextX - x) / 4, y + (nextY - y) / 4);
            continue;
        }
        r1 = _sqrt(dx1 * dx1 + dy1 * dy1); // r1, r2, and r3 correlate x and y (and z in the future). Basically 2D or 3D hypotenuse
        r2 = _sqrt(dx2 * dx2 + dy2 * dy2);
        r3 = _sqrt((dx2 / r2 + dx1 / r1) ** 2 + (dy2 / r2 + dy1 / r1) ** 2);
        tl = (r1 + r2) * curviness * 0.25 / r3;
        mx1 = x - (x - prevX) * (r1 ? tl / r1 : 0);
        mx2 = x + (nextX - x) * (r2 ? tl / r2 : 0);
        mxm = x - (mx1 + ((mx2 - mx1) * (r1 * 3 / (r1 + r2) + 0.5) / 4 || 0));
        my1 = y - (y - prevY) * (r1 ? tl / r1 : 0);
        my2 = y + (nextY - y) * (r2 ? tl / r2 : 0);
        mym = y - (my1 + ((my2 - my1) * (r1 * 3 / (r1 + r2) + 0.5) / 4 || 0));
        segment.push(_round(mx1 + mxm), _round(my1 + mym), _round(x), _round(y), _round(mx2 + mxm), _round(my2 + mym));
    }
    x !== nextX || y !== nextY || segment.length < 4 ? segment.push(_round(nextX), _round(nextY), _round(nextX), _round(nextY)) : segment.length -= 2;
    if (segment.length === 2) {
        segment.push(x, y, x, y, x, y);
    } else if (closed) {
        segment.splice(0, 6);
        segment.length -= 6;
    }
    segment.closed = closed;
    return segment;
}
//returns the squared distance between an x/y coordinate and a segment between x1/y1 and x2/y2
function pointToSegDist(x, y, x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1, t;
    if (dx || dy) {
        t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
            x1 = x2;
            y1 = y2;
        } else if (t > 0) {
            x1 += dx * t;
            y1 += dy * t;
        }
    }
    return (x - x1) ** 2 + (y - y1) ** 2;
}
function simplifyStep(points, first, last, tolerance, simplified) {
    let maxSqDist = tolerance, firstX = points[first], firstY = points[first + 1], lastX = points[last], lastY = points[last + 1], index, i, d;
    for(i = first + 2; i < last; i += 2){
        d = pointToSegDist(points[i], points[i + 1], firstX, firstY, lastX, lastY);
        if (d > maxSqDist) {
            index = i;
            maxSqDist = d;
        }
    }
    if (maxSqDist > tolerance) {
        index - first > 2 && simplifyStep(points, first, index, tolerance, simplified);
        simplified.push(points[index], points[index + 1]);
        last - index > 2 && simplifyStep(points, index, last, tolerance, simplified);
    }
}
function simplifyPoints(points, tolerance) {
    let prevX = parseFloat(points[0]), prevY = parseFloat(points[1]), temp = [
        prevX,
        prevY
    ], l = points.length - 2, i, x, y, dx, dy, result, last;
    tolerance = (tolerance || 1) ** 2;
    for(i = 2; i < l; i += 2){
        x = parseFloat(points[i]);
        y = parseFloat(points[i + 1]);
        dx = prevX - x;
        dy = prevY - y;
        if (dx * dx + dy * dy > tolerance) {
            temp.push(x, y);
            prevX = x;
            prevY = y;
        }
    }
    temp.push(parseFloat(points[l]), parseFloat(points[l + 1]));
    last = temp.length - 2;
    result = [
        temp[0],
        temp[1]
    ];
    simplifyStep(temp, 0, last, tolerance, result);
    result.push(temp[last], temp[last + 1]);
    return result;
}
function getClosestProgressOnBezier(iterations, px, py, start, end, slices, x0, y0, x1, y1, x2, y2, x3, y3) {
    let inc = (end - start) / slices, best = 0, t = start, x, y, d, dx, dy, inv;
    _bestDistance = _largeNum;
    while(t <= end){
        inv = 1 - t;
        x = inv * inv * inv * x0 + 3 * inv * inv * t * x1 + 3 * inv * t * t * x2 + t * t * t * x3;
        y = inv * inv * inv * y0 + 3 * inv * inv * t * y1 + 3 * inv * t * t * y2 + t * t * t * y3;
        dx = x - px;
        dy = y - py;
        d = dx * dx + dy * dy;
        if (d < _bestDistance) {
            _bestDistance = d;
            best = t;
        }
        t += inc;
    }
    return iterations > 1 ? getClosestProgressOnBezier(iterations - 1, px, py, Math.max(best - inc, 0), Math.min(best + inc, 1), slices, x0, y0, x1, y1, x2, y2, x3, y3) : best;
}
function getClosestData(rawPath, x, y, slices) {
    let closest = {
        j: 0,
        i: 0,
        t: 0
    }, bestDistance = _largeNum, i, j, t, segment;
    for(j = 0; j < rawPath.length; j++){
        segment = rawPath[j];
        for(i = 0; i < segment.length; i += 6){
            t = getClosestProgressOnBezier(1, x, y, 0, 1, slices || 20, segment[i], segment[i + 1], segment[i + 2], segment[i + 3], segment[i + 4], segment[i + 5], segment[i + 6], segment[i + 7]);
            if (bestDistance > _bestDistance) {
                bestDistance = _bestDistance;
                closest.j = j;
                closest.i = i;
                closest.t = t;
            }
        }
    }
    return closest;
}
function subdivideSegmentNear(x, y, segment, slices, iterations) {
    let l = segment.length, bestDistance = _largeNum, bestT = 0, bestSegmentIndex = 0, t, i;
    slices = slices || 20;
    iterations = iterations || 3;
    for(i = 0; i < l; i += 6){
        t = getClosestProgressOnBezier(1, x, y, 0, 1, slices, segment[i], segment[i + 1], segment[i + 2], segment[i + 3], segment[i + 4], segment[i + 5], segment[i + 6], segment[i + 7]);
        if (bestDistance > _bestDistance) {
            bestDistance = _bestDistance;
            bestT = t;
            bestSegmentIndex = i;
        }
    }
    t = getClosestProgressOnBezier(iterations, x, y, bestT - 0.05, bestT + 0.05, slices, segment[bestSegmentIndex], segment[bestSegmentIndex + 1], segment[bestSegmentIndex + 2], segment[bestSegmentIndex + 3], segment[bestSegmentIndex + 4], segment[bestSegmentIndex + 5], segment[bestSegmentIndex + 6], segment[bestSegmentIndex + 7]);
    subdivideSegment(segment, bestSegmentIndex, t);
    return bestSegmentIndex + 6;
}
function rawPathToString(rawPath) {
    if (_isNumber(rawPath[0])) {
        rawPath = [
            rawPath
        ];
    }
    let result = "", l = rawPath.length, sl, s, i, segment;
    for(s = 0; s < l; s++){
        segment = rawPath[s];
        result += "M" + _round(segment[0]) + "," + _round(segment[1]) + " C";
        sl = segment.length;
        for(i = 2; i < sl; i++){
            result += _round(segment[i++]) + "," + _round(segment[i++]) + " " + _round(segment[i++]) + "," + _round(segment[i++]) + " " + _round(segment[i++]) + "," + _round(segment[i]) + " ";
        }
        if (segment.closed) {
            result += "z";
        }
    }
    return result;
} /*
// takes a segment with coordinates [x, y, x, y, ...] and converts the control points into angles and lengths [x, y, angle, length, angle, length, x, y, angle, length, ...] so that it animates more cleanly and avoids odd breaks/kinks. For example, if you animate from 1 o'clock to 6 o'clock, it'd just go directly/linearly rather than around. So the length would be very short in the middle of the tween.
export function cpCoordsToAngles(segment, copy) {
	var result = copy ? segment.slice(0) : segment,
		x, y, i;
	for (i = 0; i < segment.length; i+=6) {
		x = segment[i+2] - segment[i];
		y = segment[i+3] - segment[i+1];
		result[i+2] = Math.atan2(y, x);
		result[i+3] = Math.sqrt(x * x + y * y);
		x = segment[i+6] - segment[i+4];
		y = segment[i+7] - segment[i+5];
		result[i+4] = Math.atan2(y, x);
		result[i+5] = Math.sqrt(x * x + y * y);
	}
	return result;
}

// takes a segment that was converted with cpCoordsToAngles() to have angles and lengths instead of coordinates for the control points, and converts it BACK into coordinates.
export function cpAnglesToCoords(segment, copy) {
	var result = copy ? segment.slice(0) : segment,
		length = segment.length,
		rnd = 1000,
		angle, l, i, j;
	for (i = 0; i < length; i+=6) {
		angle = segment[i+2];
		l = segment[i+3]; //length
		result[i+2] = (((segment[i] + Math.cos(angle) * l) * rnd) | 0) / rnd;
		result[i+3] = (((segment[i+1] + Math.sin(angle) * l) * rnd) | 0) / rnd;
		angle = segment[i+4];
		l = segment[i+5]; //length
		result[i+4] = (((segment[i+6] - Math.cos(angle) * l) * rnd) | 0) / rnd;
		result[i+5] = (((segment[i+7] - Math.sin(angle) * l) * rnd) | 0) / rnd;
	}
	return result;
}

//adds an "isSmooth" array to each segment and populates it with a boolean value indicating whether or not it's smooth (the control points have basically the same slope). For any smooth control points, it converts the coordinates into angle (x, in radians) and length (y) and puts them into the same index value in a smoothData array.
export function populateSmoothData(rawPath) {
	let j = rawPath.length,
		smooth, segment, x, y, x2, y2, i, l, a, a2, isSmooth, smoothData;
	while (--j > -1) {
		segment = rawPath[j];
		isSmooth = segment.isSmooth = segment.isSmooth || [0, 0, 0, 0];
		smoothData = segment.smoothData = segment.smoothData || [0, 0, 0, 0];
		isSmooth.length = 4;
		l = segment.length - 2;
		for (i = 6; i < l; i += 6) {
			x = segment[i] - segment[i - 2];
			y = segment[i + 1] - segment[i - 1];
			x2 = segment[i + 2] - segment[i];
			y2 = segment[i + 3] - segment[i + 1];
			a = _atan2(y, x);
			a2 = _atan2(y2, x2);
			smooth = (Math.abs(a - a2) < 0.09);
			if (smooth) {
				smoothData[i - 2] = a;
				smoothData[i + 2] = a2;
				smoothData[i - 1] = _sqrt(x * x + y * y);
				smoothData[i + 3] = _sqrt(x2 * x2 + y2 * y2);
			}
			isSmooth.push(smooth, smooth, 0, 0, smooth, smooth);
		}
		//if the first and last points are identical, check to see if there's a smooth transition. We must handle this a bit differently due to their positions in the array.
		if (segment[l] === segment[0] && segment[l+1] === segment[1]) {
			x = segment[0] - segment[l-2];
			y = segment[1] - segment[l-1];
			x2 = segment[2] - segment[0];
			y2 = segment[3] - segment[1];
			a = _atan2(y, x);
			a2 = _atan2(y2, x2);
			if (Math.abs(a - a2) < 0.09) {
				smoothData[l-2] = a;
				smoothData[2] = a2;
				smoothData[l-1] = _sqrt(x * x + y * y);
				smoothData[3] = _sqrt(x2 * x2 + y2 * y2);
				isSmooth[l-2] = isSmooth[l-1] = true; //don't change indexes 2 and 3 because we'll trigger everything from the END, and this will optimize file size a bit.
			}
		}
	}
	return rawPath;
}
export function pointToScreen(svgElement, point) {
	if (arguments.length < 2) { //by default, take the first set of coordinates in the path as the point
		let rawPath = getRawPath(svgElement);
		point = svgElement.ownerSVGElement.createSVGPoint();
		point.x = rawPath[0][0];
		point.y = rawPath[0][1];
	}
	return point.matrixTransform(svgElement.getScreenCTM());
}
// takes a <path> and normalizes all of its coordinates to values between 0 and 1
export function normalizePath(path) {
  path = gsap.utils.toArray(path);
  if (!path[0].hasAttribute("d")) {
    path = gsap.utils.toArray(path[0].children);
  }
  if (path.length > 1) {
    path.forEach(normalizePath);
    return path;
  }
  let _svgPathExp = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,
      _scientific = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/ig,
      d = path[0].getAttribute("d"),
      a = d.replace(_scientific, m => { let n = +m; return (n < 0.0001 && n > -0.0001) ? 0 : n; }).match(_svgPathExp),
      nums = a.filter(n => !isNaN(n)).map(n => +n),
      normalize = gsap.utils.normalize(Math.min(...nums), Math.max(...nums)),
      finals = a.map(val => isNaN(val) ? val : normalize(+val)),
      s = "",
      prevWasCommand;
  finals.forEach((value, i) => {
    let isCommand = isNaN(value)
    s += (isCommand && i ? " " : prevWasCommand || !i ? "" : ",") + value;
    prevWasCommand = isCommand;
  });
  path[0].setAttribute("d", s);
}
*/ 
}),
"[project]/apps/web/src/lib/gsap/src/CustomEase.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustomEase",
    ()=>CustomEase,
    "default",
    ()=>CustomEase
]);
/*!
 * CustomEase 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/paths.js [app-ssr] (ecmascript)");
;
let gsap, _coreInitted, _getGSAP = ()=>gsap || ("TURBOPACK compile-time value", "undefined") !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap, _initCore = ()=>{
    gsap = _getGSAP();
    if (gsap) {
        gsap.registerEase("_CE", CustomEase.create);
        _coreInitted = 1;
    } else {
        console.warn("Please gsap.registerPlugin(CustomEase)");
    }
}, _bigNum = 1e20, _round = (value)=>~~(value * 1000 + (value < 0 ? -.5 : .5)) / 1000, _bonusValidated = 1, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/gi, _needsParsingExp = /[cLlsSaAhHvVtTqQ]/g, _findMinimum = (values)=>{
    let l = values.length, min = _bigNum, i;
    for(i = 1; i < l; i += 6){
        +values[i] < min && (min = +values[i]);
    }
    return min;
}, //takes all the points and translates/scales them so that the x starts at 0 and ends at 1.
_normalize = (values, height, originY)=>{
    if (!originY && originY !== 0) {
        originY = Math.max(+values[values.length - 1], +values[1]);
    }
    let tx = +values[0] * -1, ty = -originY, l = values.length, sx = 1 / (+values[l - 2] + tx), sy = -height || (Math.abs(+values[l - 1] - +values[1]) < 0.01 * (+values[l - 2] - +values[0]) ? _findMinimum(values) + ty : +values[l - 1] + ty), i;
    if (sy) {
        sy = 1 / sy;
    } else {
        sy = -sx;
    }
    for(i = 0; i < l; i += 2){
        values[i] = (+values[i] + tx) * sx;
        values[i + 1] = (+values[i + 1] + ty) * sy;
    }
}, //note that this function returns point objects like {x, y} rather than working with segments which are arrays with alternating x, y values as in the similar function in paths.js
_bezierToPoints = function(x1, y1, x2, y2, x3, y3, x4, y4, threshold, points, index) {
    let x12 = (x1 + x2) / 2, y12 = (y1 + y2) / 2, x23 = (x2 + x3) / 2, y23 = (y2 + y3) / 2, x34 = (x3 + x4) / 2, y34 = (y3 + y4) / 2, x123 = (x12 + x23) / 2, y123 = (y12 + y23) / 2, x234 = (x23 + x34) / 2, y234 = (y23 + y34) / 2, x1234 = (x123 + x234) / 2, y1234 = (y123 + y234) / 2, dx = x4 - x1, dy = y4 - y1, d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx), d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx), length;
    if (!points) {
        points = [
            {
                x: x1,
                y: y1
            },
            {
                x: x4,
                y: y4
            }
        ];
        index = 1;
    }
    points.splice(index || points.length - 1, 0, {
        x: x1234,
        y: y1234
    });
    if ((d2 + d3) * (d2 + d3) > threshold * (dx * dx + dy * dy)) {
        length = points.length;
        _bezierToPoints(x1, y1, x12, y12, x123, y123, x1234, y1234, threshold, points, index);
        _bezierToPoints(x1234, y1234, x234, y234, x34, y34, x4, y4, threshold, points, index + 1 + (points.length - length));
    }
    return points;
};
class CustomEase {
    constructor(id, data, config){
        _coreInitted || _initCore();
        this.id = id;
        _bonusValidated && this.setData(data, config);
    }
    setData(data, config) {
        config = config || {};
        data = data || "0,0,1,1";
        let values = data.match(_numExp), closest = 1, points = [], lookup = [], precision = config.precision || 1, fast = precision <= 1, l, a1, a2, i, inc, j, point, prevPoint, p;
        this.data = data;
        if (_needsParsingExp.test(data) || ~data.indexOf("M") && data.indexOf("C") < 0) {
            values = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringToRawPath"])(data)[0];
        }
        l = values.length;
        if (l === 4) {
            values.unshift(0, 0);
            values.push(1, 1);
            l = 8;
        } else if ((l - 2) % 6) {
            throw "Invalid CustomEase";
        }
        if (+values[0] !== 0 || +values[l - 2] !== 1) {
            _normalize(values, config.height, config.originY);
        }
        this.segment = values;
        for(i = 2; i < l; i += 6){
            a1 = {
                x: +values[i - 2],
                y: +values[i - 1]
            };
            a2 = {
                x: +values[i + 4],
                y: +values[i + 5]
            };
            points.push(a1, a2);
            _bezierToPoints(a1.x, a1.y, +values[i], +values[i + 1], +values[i + 2], +values[i + 3], a2.x, a2.y, 1 / (precision * 200000), points, points.length - 1);
        }
        l = points.length;
        for(i = 0; i < l; i++){
            point = points[i];
            prevPoint = points[i - 1] || point;
            if ((point.x > prevPoint.x || prevPoint.y !== point.y && prevPoint.x === point.x || point === prevPoint) && point.x <= 1) {
                prevPoint.cx = point.x - prevPoint.x; //change in x between this point and the next point (performance optimization)
                prevPoint.cy = point.y - prevPoint.y;
                prevPoint.n = point;
                prevPoint.nx = point.x; //next point's x value (performance optimization, making lookups faster in getRatio()). Remember, the lookup will always land on a spot where it's either this point or the very next one (never beyond that)
                if (fast && i > 1 && Math.abs(prevPoint.cy / prevPoint.cx - points[i - 2].cy / points[i - 2].cx) > 2) {
                    fast = 0;
                }
                if (prevPoint.cx < closest) {
                    if (!prevPoint.cx) {
                        prevPoint.cx = 0.001; //avoids math problems in getRatio() (dividing by zero)
                        if (i === l - 1) {
                            prevPoint.x -= 0.001;
                            closest = Math.min(closest, 0.001);
                            fast = 0;
                        }
                    } else {
                        closest = prevPoint.cx;
                    }
                }
            } else {
                points.splice(i--, 1);
                l--;
            }
        }
        l = 1 / closest + 1 | 0;
        inc = 1 / l;
        j = 0;
        point = points[0];
        if (fast) {
            for(i = 0; i < l; i++){
                p = i * inc;
                if (point.nx < p) {
                    point = points[++j];
                }
                a1 = point.y + (p - point.x) / point.cx * point.cy;
                lookup[i] = {
                    x: p,
                    cx: inc,
                    y: a1,
                    cy: 0,
                    nx: 9
                };
                if (i) {
                    lookup[i - 1].cy = a1 - lookup[i - 1].y;
                }
            }
            j = points[points.length - 1];
            lookup[l - 1].cy = j.y - a1;
            lookup[l - 1].cx = j.x - lookup[lookup.length - 1].x; //make sure it lands EXACTLY where it should. Otherwise, it might be something like 0.9999999999 instead of 1.
        } else {
            for(i = 0; i < l; i++){
                if (point.nx < i * inc) {
                    point = points[++j];
                }
                lookup[i] = point;
            }
            if (j < points.length - 1) {
                lookup[i - 1] = points[points.length - 2];
            }
        }
        //this._calcEnd = (points[points.length-1].y !== 1 || points[0].y !== 0); //ensures that we don't run into floating point errors. As long as we're starting at 0 and ending at 1, tell GSAP to skip the final calculation and use 0/1 as the factor.
        this.ease = (p)=>{
            let point = lookup[p * l | 0] || lookup[l - 1];
            if (point.nx < p) {
                point = point.n;
            }
            return point.y + (p - point.x) / point.cx * point.cy;
        };
        this.ease.custom = this;
        this.id && gsap && gsap.registerEase(this.id, this.ease);
        return this;
    }
    getSVGData(config) {
        return CustomEase.getSVGData(this, config);
    }
    static create(id, data, config) {
        return new CustomEase(id, data, config).ease;
    }
    static register(core) {
        gsap = core;
        _initCore();
    }
    static get(id) {
        return gsap.parseEase(id);
    }
    static getSVGData(ease, config) {
        config = config || {};
        let width = config.width || 100, height = config.height || 100, x = config.x || 0, y = (config.y || 0) + height, e = gsap.utils.toArray(config.path)[0], a, slope, i, inc, tx, ty, precision, threshold, prevX, prevY;
        if (config.invert) {
            height = -height;
            y = 0;
        }
        if (typeof ease === "string") {
            ease = gsap.parseEase(ease);
        }
        if (ease.custom) {
            ease = ease.custom;
        }
        if (ease instanceof CustomEase) {
            a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rawPathToString"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformRawPath"])([
                ease.segment.slice(0)
            ], width, 0, 0, -height, x, y));
        } else {
            a = [
                x,
                y
            ];
            precision = Math.max(5, (config.precision || 1) * 200);
            inc = 1 / precision;
            precision += 2;
            threshold = 5 / precision;
            prevX = _round(x + inc * width);
            prevY = _round(y + ease(inc) * -height);
            slope = (prevY - y) / (prevX - x);
            for(i = 2; i < precision; i++){
                tx = _round(x + i * inc * width);
                ty = _round(y + ease(i * inc) * -height);
                if (Math.abs((ty - prevY) / (tx - prevX) - slope) > threshold || i === precision - 1) {
                    a.push(prevX, prevY);
                    slope = (ty - prevY) / (tx - prevX);
                }
                prevX = tx;
                prevY = ty;
            }
            a = "M" + a.join(",");
        }
        e && e.setAttribute("d", a);
        return a;
    }
}
CustomEase.version = "3.15.0";
CustomEase.headless = true;
_getGSAP() && gsap.registerPlugin(CustomEase);
;
}),
"[project]/apps/web/src/lib/gsap/src/SplitText.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SplitText",
    ()=>SplitText,
    "default",
    ()=>SplitText
]);
/*!
 * SplitText 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2026, GreenSock. All rights reserved. Subject to the terms at https://gsap.com/standard-license.
 * @author: Jack Doyle
 */ let gsap, _fonts, _splitProp = typeof Symbol === "function" ? Symbol() : "_split", _coreInitted, _initIfNecessary = ()=>_coreInitted || SplitText.register(window.gsap), _charSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter() : 0, _toArray = (r)=>!r ? [] : typeof r === "string" ? _toArray(document.querySelectorAll(r)) : "length" in r ? Array.from(r).reduce((acc, cur)=>{
        typeof cur === "string" ? acc.push(..._toArray(cur)) : acc.push(cur);
        return acc;
    }, []) : [
        r
    ], _elements = (targets)=>_toArray(targets).filter((e)=>e && e.nodeType === 1), _emptyArray = [], _context = function() {}, _defaultContext = {
    add: (f)=>f()
}, _spacesRegEx = /\s+/g, _emojiSafeRegEx = new RegExp("\\p{RI}\\p{RI}|\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?(\\u{200D}\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?)*|.", "gu"), _emptyBounds = {
    left: 0,
    top: 0,
    width: 0,
    height: 0
}, _findNextValidBounds = (allBounds, startIndex)=>{
    while(++startIndex < allBounds.length && allBounds[startIndex] === _emptyBounds){}
    return allBounds[startIndex] || _emptyBounds;
}, _revertOriginal = ({ element, html, ariaL, ariaH })=>{
    element.innerHTML = html;
    ariaL ? element.setAttribute("aria-label", ariaL) : element.removeAttribute("aria-label");
    ariaH ? element.setAttribute("aria-hidden", ariaH) : element.removeAttribute("aria-hidden");
}, _stretchToFitSpecialChars = (collection, specialCharsRegEx)=>{
    if (specialCharsRegEx) {
        let charsFound = new Set(collection.join("").match(specialCharsRegEx) || _emptyArray), i = collection.length, slots, word, char, combined;
        if (charsFound.size) {
            while(--i > -1){
                word = collection[i];
                for (char of charsFound){
                    if (char.startsWith(word) && char.length > word.length) {
                        slots = 0;
                        combined = word;
                        while(char.startsWith(combined += collection[i + ++slots]) && combined.length < char.length){}
                        if (slots && combined.length === char.length) {
                            collection[i] = char;
                            collection.splice(i + 1, slots);
                            break;
                        }
                    }
                }
            }
        }
    }
    return collection;
}, _disallowInline = (element)=>window.getComputedStyle(element).display === "inline" && (element.style.display = "inline-block"), _insertNodeBefore = (newChild, parent, existingChild)=>parent.insertBefore(typeof newChild === "string" ? document.createTextNode(newChild) : newChild, existingChild), _getWrapper = (type, config, collection)=>{
    let className = config[type + "sClass"] || "", { tag = "div", aria = "auto", propIndex = false } = config, display = type === "line" ? "block" : "inline-block", incrementClass = className.indexOf("++") > -1, wrapper = (text)=>{
        let el = document.createElement(tag), i = collection.length + 1;
        className && (el.className = className + (incrementClass ? " " + className + i : ""));
        propIndex && el.style.setProperty("--" + type, i + "");
        aria !== "none" && el.setAttribute("aria-hidden", "true");
        if (tag !== "span") {
            el.style.position = "relative";
            el.style.display = display;
        }
        el.textContent = text;
        collection.push(el);
        return el;
    };
    incrementClass && (className = className.replace("++", ""));
    wrapper.collection = collection;
    return wrapper;
}, _getLineWrapper = (element, nodes, config, collection)=>{
    let lineWrapper = _getWrapper("line", config, collection), textAlign = window.getComputedStyle(element).textAlign || "left";
    return (startIndex, endIndex)=>{
        let newLine = lineWrapper("");
        newLine.style.textAlign = textAlign;
        element.insertBefore(newLine, nodes[startIndex]);
        for(; startIndex < endIndex; startIndex++){
            newLine.appendChild(nodes[startIndex]);
        }
        newLine.normalize();
    };
}, _splitWordsAndCharsRecursively = (element, config, wordWrapper, charWrapper, prepForCharsOnly, deepSlice, ignore, charSplitRegEx, specialCharsRegEx, isNested)=>{
    var _a;
    let nodes = Array.from(element.childNodes), i = 0, { wordDelimiter, reduceWhiteSpace = true, prepareText } = config, elementBounds = element.getBoundingClientRect(), lastBounds = elementBounds, isPreformatted = !reduceWhiteSpace && window.getComputedStyle(element).whiteSpace.substring(0, 3) === "pre", ignoredPreviousSibling = 0, wordsCollection = wordWrapper.collection, wordDelimIsNotSpace, wordDelimString, wordDelimSplitter, curNode, words, curWordEl, startsWithSpace, endsWithSpace, j, bounds, curWordChars, clonedNode, curSubNode, tempSubNode, curTextContent, wordText, lastWordText, k;
    if (typeof wordDelimiter === "object") {
        wordDelimSplitter = wordDelimiter.delimiter || wordDelimiter;
        wordDelimString = wordDelimiter.replaceWith || "";
    } else {
        wordDelimString = wordDelimiter === "" ? "" : wordDelimiter || " ";
    }
    wordDelimIsNotSpace = wordDelimString !== " ";
    for(; i < nodes.length; i++){
        curNode = nodes[i];
        if (curNode.nodeType === 3) {
            curTextContent = curNode.textContent || "";
            if (reduceWhiteSpace) {
                curTextContent = curTextContent.replace(_spacesRegEx, " ");
            } else if (isPreformatted) {
                curTextContent = curTextContent.replace(/\n/g, wordDelimString + "\n");
            }
            prepareText && (curTextContent = prepareText(curTextContent, element));
            curNode.textContent = curTextContent;
            words = wordDelimString || wordDelimSplitter ? curTextContent.split(wordDelimSplitter || wordDelimString) : curTextContent.match(charSplitRegEx) || _emptyArray;
            lastWordText = words[words.length - 1];
            endsWithSpace = wordDelimIsNotSpace ? lastWordText.slice(-1) === " " : !lastWordText;
            lastWordText || words.pop();
            lastBounds = elementBounds;
            startsWithSpace = wordDelimIsNotSpace ? words[0].charAt(0) === " " : !words[0];
            startsWithSpace && _insertNodeBefore(" ", element, curNode);
            words[0] || words.shift();
            _stretchToFitSpecialChars(words, specialCharsRegEx);
            deepSlice && isNested || (curNode.textContent = "");
            for(j = 1; j <= words.length; j++){
                wordText = words[j - 1];
                if (!reduceWhiteSpace && isPreformatted && wordText.charAt(0) === "\n") {
                    (_a = curNode.previousSibling) == null ? void 0 : _a.remove();
                    _insertNodeBefore(document.createElement("br"), element, curNode);
                    wordText = wordText.slice(1);
                }
                if (!reduceWhiteSpace && wordText === "") {
                    _insertNodeBefore(wordDelimString, element, curNode);
                } else if (wordText === " ") {
                    element.insertBefore(document.createTextNode(" "), curNode);
                } else {
                    wordDelimIsNotSpace && wordText.charAt(0) === " " && _insertNodeBefore(" ", element, curNode);
                    if (ignoredPreviousSibling && j === 1 && !startsWithSpace && wordsCollection.indexOf(ignoredPreviousSibling.parentNode) > -1) {
                        curWordEl = wordsCollection[wordsCollection.length - 1];
                        curWordEl.appendChild(document.createTextNode(charWrapper ? "" : wordText));
                    } else {
                        curWordEl = wordWrapper(charWrapper ? "" : wordText);
                        _insertNodeBefore(curWordEl, element, curNode);
                        ignoredPreviousSibling && j === 1 && !startsWithSpace && curWordEl.insertBefore(ignoredPreviousSibling, curWordEl.firstChild);
                    }
                    if (charWrapper) {
                        curWordChars = _charSegmenter ? _stretchToFitSpecialChars([
                            ..._charSegmenter.segment(wordText)
                        ].map((s)=>s.segment), specialCharsRegEx) : wordText.match(charSplitRegEx) || _emptyArray;
                        for(k = 0; k < curWordChars.length; k++){
                            curWordEl.appendChild(curWordChars[k] === " " ? document.createTextNode(" ") : charWrapper(curWordChars[k]));
                        }
                    }
                    if (deepSlice && isNested) {
                        curTextContent = curNode.textContent = curTextContent.substring(wordText.length + 1, curTextContent.length);
                        bounds = curWordEl.getBoundingClientRect();
                        if (bounds.top > lastBounds.top && bounds.left <= lastBounds.left) {
                            clonedNode = element.cloneNode();
                            curSubNode = element.childNodes[0];
                            while(curSubNode && curSubNode !== curWordEl){
                                tempSubNode = curSubNode;
                                curSubNode = curSubNode.nextSibling;
                                clonedNode.appendChild(tempSubNode);
                            }
                            element.parentNode.insertBefore(clonedNode, element);
                            prepForCharsOnly && _disallowInline(clonedNode);
                        }
                        lastBounds = bounds;
                    }
                    if (j < words.length || endsWithSpace) {
                        _insertNodeBefore(j >= words.length ? " " : wordDelimIsNotSpace && wordText.slice(-1) === " " ? " " + wordDelimString : wordDelimString, element, curNode);
                    }
                }
            }
            element.removeChild(curNode);
            ignoredPreviousSibling = 0;
        } else if (curNode.nodeType === 1) {
            if (ignore && ignore.indexOf(curNode) > -1) {
                wordsCollection.indexOf(curNode.previousSibling) > -1 && wordsCollection[wordsCollection.length - 1].appendChild(curNode);
                ignoredPreviousSibling = curNode;
            } else {
                _splitWordsAndCharsRecursively(curNode, config, wordWrapper, charWrapper, prepForCharsOnly, deepSlice, ignore, charSplitRegEx, specialCharsRegEx, true);
                ignoredPreviousSibling = 0;
            }
            prepForCharsOnly && _disallowInline(curNode);
        }
    }
};
const _SplitText = class _SplitText {
    constructor(elements, config){
        this.isSplit = false;
        _initIfNecessary();
        this.elements = _elements(elements);
        this.chars = [];
        this.words = [];
        this.lines = [];
        this.masks = [];
        this.vars = config;
        this.elements.forEach((el)=>{
            var _a;
            config.overwrite !== false && ((_a = el[_splitProp]) == null ? void 0 : _a._data.orig.filter(({ element })=>element === el).forEach(_revertOriginal));
            el[_splitProp] = this;
        });
        this._split = ()=>this.isSplit && this.split(this.vars);
        let orig = [], timerId, checkWidths = ()=>{
            let i = orig.length, o;
            while(i--){
                o = orig[i];
                let w = o.element.offsetWidth;
                if (w !== o.width) {
                    o.width = w;
                    this._split();
                    return;
                }
            }
        };
        this._data = {
            orig,
            obs: typeof ResizeObserver !== "undefined" && new ResizeObserver(()=>{
                clearTimeout(timerId);
                timerId = setTimeout(checkWidths, 200);
            })
        };
        _context(this);
        this.split(config);
    }
    split(config) {
        (this._ctx || _defaultContext).add(()=>{
            this.isSplit && this.revert();
            this.vars = config = config || this.vars || {};
            let { type = "chars,words,lines", aria = "auto", deepSlice = true, smartWrap, onSplit, autoSplit = false, specialChars, mask } = this.vars, splitLines = type.indexOf("lines") > -1, splitCharacters = type.indexOf("chars") > -1, splitWords = type.indexOf("words") > -1, onlySplitCharacters = splitCharacters && !splitWords && !splitLines, specialCharsRegEx = specialChars && ("push" in specialChars ? new RegExp("(?:" + specialChars.join("|") + ")", "gu") : specialChars), finalCharSplitRegEx = specialCharsRegEx ? new RegExp(specialCharsRegEx.source + "|" + _emojiSafeRegEx.source, "gu") : _emojiSafeRegEx, ignore = !!config.ignore && _elements(config.ignore), { orig, animTime, obs } = this._data, onSplitResult;
            if (splitCharacters || splitWords || splitLines) {
                this.elements.forEach((element, index)=>{
                    orig[index] = {
                        element,
                        html: element.innerHTML,
                        ariaL: element.getAttribute("aria-label"),
                        ariaH: element.getAttribute("aria-hidden")
                    };
                    aria === "auto" ? element.setAttribute("aria-label", (element.textContent || "").trim()) : aria === "hidden" && element.setAttribute("aria-hidden", "true");
                    let chars = [], words = [], lines = [], charWrapper = splitCharacters ? _getWrapper("char", config, chars) : null, wordWrapper = _getWrapper("word", config, words), i, curWord, smartWrapSpan, nextSibling;
                    _splitWordsAndCharsRecursively(element, config, wordWrapper, charWrapper, onlySplitCharacters, deepSlice && (splitLines || onlySplitCharacters), ignore, finalCharSplitRegEx, specialCharsRegEx, false);
                    if (splitLines) {
                        let nodes = _toArray(element.childNodes), wrapLine = _getLineWrapper(element, nodes, config, lines), curNode, toRemove = [], lineStartIndex = 0, allBounds = nodes.map((n)=>n.nodeType === 1 ? n.getBoundingClientRect() : _emptyBounds), lastBounds = _emptyBounds, curBounds;
                        for(i = 0; i < nodes.length; i++){
                            curNode = nodes[i];
                            if (curNode.nodeType === 1) {
                                if (curNode.nodeName === "BR") {
                                    if (!i || nodes[i - 1].nodeName !== "BR") {
                                        toRemove.push(curNode);
                                        wrapLine(lineStartIndex, i + 1);
                                    }
                                    lineStartIndex = i + 1;
                                    lastBounds = _findNextValidBounds(allBounds, i);
                                } else {
                                    curBounds = allBounds[i];
                                    if (i && curBounds.top > lastBounds.top && curBounds.left < lastBounds.left + lastBounds.width - 1) {
                                        wrapLine(lineStartIndex, i);
                                        lineStartIndex = i;
                                    }
                                    lastBounds = curBounds;
                                }
                            }
                        }
                        lineStartIndex < i && wrapLine(lineStartIndex, i);
                        toRemove.forEach((el)=>{
                            var _a;
                            return (_a = el.parentNode) == null ? void 0 : _a.removeChild(el);
                        });
                    }
                    if (!splitWords) {
                        for(i = 0; i < words.length; i++){
                            curWord = words[i];
                            if (splitCharacters || !curWord.nextSibling || curWord.nextSibling.nodeType !== 3) {
                                if (smartWrap && !splitLines) {
                                    smartWrapSpan = document.createElement("span");
                                    smartWrapSpan.style.whiteSpace = "nowrap";
                                    while(curWord.firstChild){
                                        smartWrapSpan.appendChild(curWord.firstChild);
                                    }
                                    curWord.replaceWith(smartWrapSpan);
                                } else {
                                    curWord.replaceWith(...curWord.childNodes);
                                }
                            } else {
                                nextSibling = curWord.nextSibling;
                                if (nextSibling && nextSibling.nodeType === 3) {
                                    nextSibling.textContent = (curWord.textContent || "") + (nextSibling.textContent || "");
                                    curWord.remove();
                                }
                            }
                        }
                        words.length = 0;
                        element.normalize();
                    }
                    this.lines.push(...lines);
                    this.words.push(...words);
                    this.chars.push(...chars);
                });
                mask && this[mask] && this.masks.push(...this[mask].map((el)=>{
                    let maskEl = el.cloneNode();
                    el.replaceWith(maskEl);
                    maskEl.appendChild(el);
                    el.className && (maskEl.className = el.className.trim().split(" ").map((s)=>s + "-mask").join(" "));
                    maskEl.style.overflow = "clip";
                    return maskEl;
                }));
            }
            this.isSplit = true;
            _fonts && splitLines && autoSplit && _fonts.addEventListener("loadingdone", this._split);
            if ((onSplitResult = onSplit && onSplit(this)) && onSplitResult.totalTime) {
                this._data.anim = animTime ? onSplitResult.totalTime(animTime) : onSplitResult;
            }
            splitLines && autoSplit && this.elements.forEach((element, index)=>{
                orig[index].width = element.offsetWidth;
                obs && obs.observe(element);
            });
        });
        return this;
    }
    kill() {
        let { obs } = this._data;
        obs && obs.disconnect();
        _fonts == null ? void 0 : _fonts.removeEventListener("loadingdone", this._split);
    }
    revert() {
        var _a, _b;
        if (this.isSplit) {
            let { orig, anim } = this._data;
            this.kill();
            orig.forEach(_revertOriginal);
            this.chars.length = this.words.length = this.lines.length = orig.length = this.masks.length = 0;
            this.isSplit = false;
            if (anim) {
                this._data.animTime = anim.totalTime();
                anim.revert();
            }
            (_b = (_a = this.vars).onRevert) == null ? void 0 : _b.call(_a, this);
        }
        return this;
    }
    static create(elements, config) {
        return new _SplitText(elements, config);
    }
    static register(core) {
        gsap = gsap || core || window.gsap;
        if (gsap) {
            _toArray = gsap.utils.toArray;
            _context = gsap.core.context || _context;
        }
        if (!_coreInitted && window.innerWidth > 0) {
            _fonts = document.fonts;
            _coreInitted = true;
        }
    }
};
_SplitText.version = "3.15.0";
let SplitText = _SplitText;
;
}),
"[project]/apps/web/src/lib/gsap/src/DrawSVGPlugin.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DrawSVGPlugin",
    ()=>DrawSVGPlugin,
    "default",
    ()=>DrawSVGPlugin
]);
/*!
 * DrawSVGPlugin 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ let gsap, _toArray, _doc, _win, _isEdge, _coreInitted, _warned, _getStyleSaver, _reverting, _windowExists = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined", _getGSAP = ()=>gsap || _windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap, _numExp = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi, _types = {
    rect: [
        "width",
        "height"
    ],
    circle: [
        "r",
        "r"
    ],
    ellipse: [
        "rx",
        "ry"
    ],
    line: [
        "x2",
        "y2"
    ]
}, _round = (value)=>Math.round(value * 10000) / 10000, _parseNum = (value)=>parseFloat(value) || 0, _parseSingleVal = (value, length)=>{
    let num = _parseNum(value);
    return ~value.indexOf("%") ? num / 100 * length : num;
}, _getAttributeAsNumber = (target, attr)=>_parseNum(target.getAttribute(attr)), _sqrt = Math.sqrt, _getDistance = (x1, y1, x2, y2, scaleX, scaleY)=>_sqrt(((_parseNum(x2) - _parseNum(x1)) * scaleX) ** 2 + ((_parseNum(y2) - _parseNum(y1)) * scaleY) ** 2), _warn = (message)=>console.warn(message), _hasNonScalingStroke = (target)=>target.getAttribute("vector-effect") === "non-scaling-stroke", _bonusValidated = 1, //accepts values like "100%" or "20% 80%" or "20 50" and parses it into an absolute start and end position on the line/stroke based on its length. Returns an an array with the start and end values, like [0, 243]
_parse = (value, length, defaultStart)=>{
    let i = value.indexOf(" "), s, e;
    if (i < 0) {
        s = defaultStart !== undefined ? defaultStart + "" : value;
        e = value;
    } else {
        s = value.substr(0, i);
        e = value.substr(i + 1);
    }
    s = _parseSingleVal(s, length);
    e = _parseSingleVal(e, length);
    return s > e ? [
        e,
        s
    ] : [
        s,
        e
    ];
}, _getLength = (target)=>{
    target = _toArray(target)[0];
    if (!target) {
        return 0;
    }
    let type = target.tagName.toLowerCase(), style = target.style, scaleX = 1, scaleY = 1, length, bbox, points, prevPoint, i, rx, ry;
    if (_hasNonScalingStroke(target)) {
        scaleY = target.getScreenCTM();
        scaleX = _sqrt(scaleY.a * scaleY.a + scaleY.b * scaleY.b);
        scaleY = _sqrt(scaleY.d * scaleY.d + scaleY.c * scaleY.c);
    }
    try {
        bbox = target.getBBox(); //solely for fixing bug in IE - we don't actually use the bbox.
    } catch (e) {
        //firefox has a bug that throws an error if the element isn't visible.
        _warn("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
    }
    let { x, y, width, height } = bbox || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    if ((!bbox || !width && !height) && _types[type]) {
        width = _getAttributeAsNumber(target, _types[type][0]);
        height = _getAttributeAsNumber(target, _types[type][1]);
        if (type !== "rect" && type !== "line") {
            width *= 2;
            height *= 2;
        }
        if (type === "line") {
            x = _getAttributeAsNumber(target, "x1");
            y = _getAttributeAsNumber(target, "y1");
            width = Math.abs(width - x);
            height = Math.abs(height - y);
        }
    }
    if (type === "path") {
        prevPoint = style.strokeDasharray;
        style.strokeDasharray = "none";
        length = target.getTotalLength() || 0;
        _round(scaleX) !== _round(scaleY) && !_warned && (_warned = 1) && _warn("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled.");
        length *= (scaleX + scaleY) / 2;
        style.strokeDasharray = prevPoint;
    } else if (type === "rect") {
        length = width * 2 * scaleX + height * 2 * scaleY;
    } else if (type === "line") {
        length = _getDistance(x, y, x + width, y + height, scaleX, scaleY);
    } else if (type === "polyline" || type === "polygon") {
        points = target.getAttribute("points").match(_numExp) || [];
        type === "polygon" && points.push(points[0], points[1]);
        length = 0;
        for(i = 2; i < points.length; i += 2){
            length += _getDistance(points[i - 2], points[i - 1], points[i], points[i + 1], scaleX, scaleY) || 0;
        }
    } else if (type === "circle" || type === "ellipse") {
        rx = width / 2 * scaleX;
        ry = height / 2 * scaleY;
        length = Math.PI * (3 * (rx + ry) - _sqrt((3 * rx + ry) * (rx + 3 * ry)));
    }
    return length || 0;
}, _getPosition = (target, length)=>{
    target = _toArray(target)[0];
    if (!target) {
        return [
            0,
            0
        ];
    }
    length || (length = _getLength(target) + 1);
    let cs = _win.getComputedStyle(target), dash = cs.strokeDasharray || "", offset = _parseNum(cs.strokeDashoffset), i = dash.indexOf(",");
    i < 0 && (i = dash.indexOf(" "));
    dash = i < 0 ? length : _parseNum(dash.substr(0, i));
    dash > length && (dash = length);
    return [
        -offset || 0,
        dash - offset || 0
    ];
}, _initCore = ()=>{
    if (_windowExists()) //TURBOPACK unreachable
    ;
};
const DrawSVGPlugin = {
    version: "3.15.0",
    name: "drawSVG",
    register (core) {
        gsap = core;
        _initCore();
    },
    init (target, value, tween, index, targets) {
        if (!target.getBBox) {
            return false;
        }
        _coreInitted || _initCore();
        let length = _getLength(target), start, end, cs;
        this.styles = _getStyleSaver && _getStyleSaver(target, "strokeDashoffset,strokeDasharray,strokeMiterlimit");
        this.tween = tween;
        this._style = target.style;
        this._target = target;
        if (value + "" === "true") {
            value = "0 100%";
        } else if (!value) {
            value = "0 0";
        } else if ((value + "").indexOf(" ") === -1) {
            value = "0 " + value;
        }
        start = _getPosition(target, length);
        end = _parse(value, length, start[0]);
        this._length = _round(length);
        this._dash = _round(start[1] - start[0]); //some browsers render artifacts if dash is 0, so we use a very small number in that case.
        this._offset = _round(-start[0]);
        this._dashPT = this.add(this, "_dash", this._dash, _round(end[1] - end[0]), 0, 0, 0, 0, 0, 1);
        this._offsetPT = this.add(this, "_offset", this._offset, _round(-end[0]), 0, 0, 0, 0, 0, 1);
        if (_isEdge) {
            cs = _win.getComputedStyle(target);
            if (cs.strokeLinecap !== cs.strokeLinejoin) {
                end = _parseNum(cs.strokeMiterlimit);
                this.add(target.style, "strokeMiterlimit", end, end + 0.01);
            }
        }
        this._live = _hasNonScalingStroke(target) || ~(value + "").indexOf("live");
        this._nowrap = ~(value + "").indexOf("nowrap");
        this._props.push("drawSVG");
        return _bonusValidated;
    },
    render (ratio, data) {
        if (data.tween._time || !_reverting()) {
            let pt = data._pt, style = data._style, length, lengthRatio, dash, offset;
            if (pt) {
                //when the element has vector-effect="non-scaling-stroke" and the SVG is resized (like on a window resize), it actually changes the length of the stroke! So we must sense that and make the proper adjustments.
                if (data._live) {
                    length = _getLength(data._target);
                    if (length !== data._length) {
                        lengthRatio = length / data._length;
                        data._length = length;
                        if (data._offsetPT) {
                            data._offsetPT.s *= lengthRatio;
                            data._offsetPT.c *= lengthRatio;
                        }
                        if (data._dashPT) {
                            data._dashPT.s *= lengthRatio;
                            data._dashPT.c *= lengthRatio;
                        } else {
                            data._dash *= lengthRatio;
                        }
                    }
                }
                while(pt){
                    pt.r(ratio, pt.d);
                    pt = pt._next;
                }
                dash = data._dash || ratio && ratio !== 1 && 0.0001 || 0; // only let it be zero if it's at the start or end of the tween.
                length = data._length - dash + 0.1;
                offset = data._offset;
                dash && offset && dash + Math.abs(offset % data._length) > data._length - 0.05 && (offset += offset < 0 ? 0.005 : -0.005) && (length += 0.005);
                style.strokeDashoffset = dash ? offset : offset + 0.001;
                style.strokeDasharray = length < 0.1 ? "none" : dash ? dash + "px," + (data._nowrap ? 999999 : length) + "px" : "0px, 999999px";
            }
        } else {
            data.styles.revert();
        }
    },
    getLength: _getLength,
    getPosition: _getPosition
};
_getGSAP() && gsap.registerPlugin(DrawSVGPlugin);
;
}),
"[project]/apps/web/src/lib/gsap/src/MorphSVGPlugin.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MorphSVGPlugin",
    ()=>MorphSVGPlugin,
    "default",
    ()=>MorphSVGPlugin
]);
/*!
 * MorphSVGPlugin 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/paths.js [app-ssr] (ecmascript)");
;
let gsap, _toArray, _lastLinkedAnchor, _doc, _coreInitted, PluginClass, _reverting, _getGSAP = ()=>gsap || ("TURBOPACK compile-time value", "undefined") !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap, _isFunction = (value)=>typeof value === "function", _atan2 = Math.atan2, _cos = Math.cos, _sin = Math.sin, _sqrt = Math.sqrt, _PI = Math.PI, _2PI = _PI * 2, _angleMin = _PI * 0.3, _angleMax = _PI * 0.7, _bigNum = 1e20, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/gi, _selectorExp = /(^[#.][a-z]|[a-y][a-z])/i, _commands = /[achlmqstvz]/i, _log = (message)=>console && console.warn(message), _round = (value)=>Math.round(value * 1e5) / 1e5 || 0, _getAverageXY = (segment)=>{
    let l = segment.length, x = 0, y = 0, i;
    for(i = 0; i < l; i++){
        x += segment[i++];
        y += segment[i];
    }
    return [
        x / (l / 2),
        y / (l / 2)
    ];
}, _getSize = (segment)=>{
    let l = segment.length, xMax = segment[0], xMin = xMax, yMax = segment[1], yMin = yMax, x, y, i;
    for(i = 6; i < l; i += 6){
        x = segment[i];
        y = segment[i + 1];
        if (x > xMax) {
            xMax = x;
        } else if (x < xMin) {
            xMin = x;
        }
        if (y > yMax) {
            yMax = y;
        } else if (y < yMin) {
            yMin = y;
        }
    }
    segment.centerX = (xMax + xMin) / 2;
    segment.centerY = (yMax + yMin) / 2;
    return segment.size = (xMax - xMin) * (yMax - yMin);
}, _getTotalSize = (rawPath, samplesPerBezier = 3)=>{
    let j = rawPath.length, xMax = rawPath[0][0], xMin = xMax, yMax = rawPath[0][1], yMin = yMax, inc = 1 / samplesPerBezier, l, x, y, i, segment, k, t, inv, x1, y1, x2, x3, x4, y2, y3, y4;
    while(--j > -1){
        segment = rawPath[j];
        l = segment.length;
        for(i = 6; i < l; i += 6){
            x1 = segment[i];
            y1 = segment[i + 1];
            x2 = segment[i + 2] - x1;
            y2 = segment[i + 3] - y1;
            x3 = segment[i + 4] - x1;
            y3 = segment[i + 5] - y1;
            x4 = segment[i + 6] - x1;
            y4 = segment[i + 7] - y1;
            k = samplesPerBezier;
            while(--k > -1){
                t = inc * k;
                inv = 1 - t;
                x = (t * t * x4 + 3 * inv * (t * x3 + inv * x2)) * t + x1;
                y = (t * t * y4 + 3 * inv * (t * y3 + inv * y2)) * t + y1;
                if (x > xMax) {
                    xMax = x;
                } else if (x < xMin) {
                    xMin = x;
                }
                if (y > yMax) {
                    yMax = y;
                } else if (y < yMin) {
                    yMin = y;
                }
            }
        }
    }
    rawPath.centerX = (xMax + xMin) / 2;
    rawPath.centerY = (yMax + yMin) / 2;
    rawPath.left = xMin;
    rawPath.width = xMax - xMin;
    rawPath.top = yMin;
    rawPath.height = yMax - yMin;
    return rawPath.size = (xMax - xMin) * (yMax - yMin);
}, _sortByComplexity = (a, b)=>b.length - a.length, _sortBySize = (a, b)=>{
    let sizeA = a.size || _getSize(a), sizeB = b.size || _getSize(b);
    return Math.abs(sizeB - sizeA) < (sizeA + sizeB) / 20 ? b.centerX - a.centerX || b.centerY - a.centerY : sizeB - sizeA; //if the size is within 10% of each other, prioritize position from left to right, then top to bottom.
}, _offsetSegment = (segment, shapeIndex)=>{
    let a = segment.slice(0), l = segment.length, wrap = l - 2, i, index;
    shapeIndex = shapeIndex | 0;
    for(i = 0; i < l; i++){
        index = (i + shapeIndex) % wrap;
        segment[i++] = a[index];
        segment[i] = a[index + 1];
    }
}, _getTotalMovement = (sb, eb, shapeIndex, offsetX, offsetY)=>{
    let l = sb.length, d = 0, wrap = l - 2, index, i, x, y;
    shapeIndex *= 6;
    for(i = 0; i < l; i += 6){
        index = (i + shapeIndex) % wrap;
        y = sb[index] - (eb[i] - offsetX);
        x = sb[index + 1] - (eb[i + 1] - offsetY);
        d += _sqrt(x * x + y * y);
    }
    return d;
}, _getClosestShapeIndex = (sb, eb, checkReverse)=>{
    let l = sb.length, sCenter = _getAverageXY(sb), eCenter = _getAverageXY(eb), offsetX = eCenter[0] - sCenter[0], offsetY = eCenter[1] - sCenter[1], min = _getTotalMovement(sb, eb, 0, offsetX, offsetY), minIndex = 0, copy, d, i;
    for(i = 6; i < l; i += 6){
        d = _getTotalMovement(sb, eb, i / 6, offsetX, offsetY);
        if (d < min) {
            min = d;
            minIndex = i;
        }
    }
    if (checkReverse) {
        copy = sb.slice(0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reverseSegment"])(copy);
        for(i = 6; i < l; i += 6){
            d = _getTotalMovement(copy, eb, i / 6, offsetX, offsetY);
            if (d < min) {
                min = d;
                minIndex = -i;
            }
        }
    }
    return minIndex / 6;
}, _getClosestAnchor = (rawPath, x, y)=>{
    let j = rawPath.length, closestDistance = _bigNum, closestX = 0, closestY = 0, segment, dx, dy, d, i, l;
    while(--j > -1){
        segment = rawPath[j];
        l = segment.length;
        for(i = 0; i < l; i += 6){
            dx = segment[i] - x;
            dy = segment[i + 1] - y;
            d = _sqrt(dx * dx + dy * dy);
            if (d < closestDistance) {
                closestDistance = d;
                closestX = segment[i];
                closestY = segment[i + 1];
            }
        }
    }
    return [
        closestX,
        closestY
    ];
}, _getClosestSegment = (bezier, pool, startIndex, sortRatio, offsetX, offsetY)=>{
    let l = pool.length, index = 0, minSize = Math.min(bezier.size || _getSize(bezier), pool[startIndex].size || _getSize(pool[startIndex])) * sortRatio, min = _bigNum, cx = bezier.centerX + offsetX, cy = bezier.centerY + offsetY, size, i, dx, dy, d;
    for(i = startIndex; i < l; i++){
        size = pool[i].size || _getSize(pool[i]);
        if (size < minSize) {
            break;
        }
        dx = pool[i].centerX - cx;
        dy = pool[i].centerY - cy;
        d = _sqrt(dx * dx + dy * dy);
        if (d < min) {
            index = i;
            min = d;
        }
    }
    d = pool[index];
    pool.splice(index, 1);
    return d;
}, _addAnchorsToBezier = (segment, i, quantity = 1)=>{
    let ax = segment[i], ay = segment[i + 1], cp1x = segment[i + 2], cp1y = segment[i + 3], cp2x = segment[i + 4], cp2y = segment[i + 5], bx = segment[i + 6], by = segment[i + 7], t, x1a, x2, y1a, y2, x1, y1, x2a, y2a;
    while(quantity-- > 0){
        t = 1 - 1 / (quantity + 2);
        x1a = ax + (cp1x - ax) * t;
        x2 = cp1x + (cp2x - cp1x) * t;
        y1a = ay + (cp1y - ay) * t;
        y2 = cp1y + (cp2y - cp1y) * t;
        x1 = x1a + (x2 - x1a) * t;
        y1 = y1a + (y2 - y1a) * t;
        x2a = cp2x + (bx - cp2x) * t;
        y2a = cp2y + (by - cp2y) * t;
        x2 += (x2a - x2) * t;
        y2 += (y2a - y2) * t;
        segment.splice(i + 2, 4, cp1x = _round(x1a), cp1y = _round(y1a), cp2x = _round(x1), cp2y = _round(y1), bx = _round(x1 + (x2 - x1) * t), by = _round(y1 + (y2 - y1) * t), _round(x2), _round(y2), _round(x2a), _round(y2a));
    }
}, _getLargestIndex = (a)=>{
    let i = a.length, max = -_bigNum, largestIndex;
    while(i--){
        if (a[i] > max) {
            max = a[i];
            largestIndex = i;
        }
    }
    return largestIndex;
}, // adds a certain number of anchors to a segment (made up of cubic Beziers), distributed as evenly as possible so that the longer Beziers get subdivided more. Even distribution of anchors leads to smoother morphs/interpolation
_subdivideSegmentQty = (segment, quantity)=>{
    let distances = [], anchorsToAdd = [], l = segment.length - 2, i = 0;
    for(; i < l; i += 6){
        distances.push((segment[i] - segment[i + 6]) ** 2 + (segment[i + 1] - segment[i + 7]) ** 2);
    }
    while(quantity--){
        i = _getLargestIndex(distances);
        anchorsToAdd[i] = l = (anchorsToAdd[i] || 0) + 1;
        distances[i] *= l / (l + 1);
    }
    i = distances.length;
    while(i--){
        anchorsToAdd[i] && _addAnchorsToBezier(segment, i * 6, anchorsToAdd[i]);
    }
}, _getDefaultSmoothPoints = (rawPath, skipMeasure)=>{
    skipMeasure || (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cacheRawPathMeasurements"])(rawPath);
    return Math.max(4, Math.round(rawPath.totalLength / 4));
}, _cloneAndSortRawPath = (ar)=>ar.slice(0).sort(_sortByComplexity), _segmentCanBeIgnored = (segment)=>{
    let x = segment[0], y = segment[1], i = 2;
    for(; i < segment.length; i += 2){
        if (Math.abs(segment[i] - x) > 0.01 || Math.abs(segment[i + 1] - y) > 0.01) {
            return false;
        }
    }
    return true;
}, _smoothRawPath = (rawPath, config)=>{
    config = config || {};
    let { redraw, points, maxSegments = 999 } = config, pointsAdded = 0, sortedRawPath = rawPath, templateRawPath = Array.isArray(points) ? points : 0, segmentPointsToAdd, j, segment, smoothSegment, anchorDistance;
    redraw = redraw !== false;
    // redrawing forces the points to be more evenly distributed across the entire path, which leads to smoother morphs/interpolations but also sacrifices fidelity to the original shape. We must measure the path to do all the calculations properly.
    if (redraw) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cacheRawPathMeasurements"])(rawPath); // only burn CPU cycles for measuring if we're redrawing
    } else {
        rawPath.totalPoints = 0;
        j = rawPath.length;
        while(j--){
            rawPath.totalPoints += rawPath[j].length;
        }
    }
    if (templateRawPath) {
        sortedRawPath = _cloneAndSortRawPath(rawPath);
        templateRawPath = _cloneAndSortRawPath(templateRawPath);
        anchorDistance = templateRawPath[0].totalLength / Math.round(templateRawPath[0].length / 6);
    } else {
        if (!points || points === "auto") {
            points = _getDefaultSmoothPoints(rawPath, redraw);
            redraw || (points -= Math.round(rawPath.totalPoints / 6));
        }
        points = Math.max(redraw ? 10 : 4, Math.min(999, points));
    }
    for(j = 0; j < sortedRawPath.length; j++){
        segment = sortedRawPath[j];
        segmentPointsToAdd = Math.max(redraw ? 10 : 4, templateRawPath ? Math.round(templateRawPath[j] ? templateRawPath[j].length / 6 : sortedRawPath[j].totalLength / anchorDistance || 0) : Math.round((pointsAdded / points + (redraw ? segment.totalLength / rawPath.totalLength : segment.length / rawPath.totalPoints)) * points) - pointsAdded);
        if (j >= maxSegments || templateRawPath && (!templateRawPath[j] || _segmentCanBeIgnored(templateRawPath[j]))) {
        // do nothing (skip) if the segment is too small or if it is beyond the maximum number of segments to process (like when the corresponding segment in the start/end RawPath doesn't exist)
        } else if (redraw) {
            smoothSegment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointsToSegment"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["segmentToDistributedPoints"])(segment, segmentPointsToAdd), config.curviness);
            segment.length = 0;
            segment.push(...smoothSegment);
        } else {
            _subdivideSegmentQty(segment, segmentPointsToAdd);
        }
        pointsAdded += segmentPointsToAdd;
    }
    return rawPath;
}, _equalizeSegmentQuantity = (start, end, shapeIndex, map, fillSafe)=>{
    let dif = end.length - start.length, longer = dif > 0 ? end : start, shorter = dif > 0 ? start : end, added = 0, sortMethod = map === "complexity" ? _sortByComplexity : _sortBySize, sortRatio = map === "position" ? 0 : typeof map === "number" ? map : 0.8, i = shorter.length, shapeIndices = typeof shapeIndex === "object" && shapeIndex.push ? shapeIndex.slice(0) : [
        shapeIndex
    ], reverse = shapeIndices[0] === "reverse" || shapeIndices[0] < 0, log = shapeIndex === "log", eb, sb, b, x, y, offsetX, offsetY;
    if (!shorter[0]) {
        return;
    }
    if (longer.length > 1) {
        start.sort(sortMethod);
        end.sort(sortMethod);
        longer.size || _getTotalSize(longer); // ensures centerX and centerY are defined (used below).
        shorter.size || _getTotalSize(shorter);
        offsetX = longer.centerX - shorter.centerX;
        offsetY = longer.centerY - shorter.centerY;
        if (sortMethod === _sortBySize) {
            for(i = 0; i < shorter.length; i++){
                longer.splice(i, 0, _getClosestSegment(shorter[i], longer, i, sortRatio, offsetX, offsetY));
            }
        }
    }
    if (dif) {
        dif < 0 && (dif = -dif);
        longer[0].length > shorter[0].length && _subdivideSegmentQty(shorter[0], (longer[0].length - shorter[0].length) / 6 | 0); // since we use shorter[0] as the one to map the origination point of any brand new fabricated segments, do any subdividing first so that there are more points to choose from (if necessary)
        i = shorter.length;
        while(added < dif){
            x = longer[i].size || _getSize(longer[i]); //just to ensure centerX and centerY are calculated which we use on the next line.
            b = _getClosestAnchor(shorter, longer[i].centerX, longer[i].centerY);
            x = b[0];
            y = b[1];
            shorter[i++] = [
                x,
                y,
                x,
                y,
                x,
                y,
                x,
                y
            ];
            shorter.totalPoints += 8;
            added++;
        }
    }
    for(i = 0; i < start.length; i++){
        eb = end[i];
        sb = start[i];
        dif = eb.length - sb.length;
        if (dif < 0) {
            _subdivideSegmentQty(eb, -dif / 6 | 0);
        } else if (dif > 0) {
            _subdivideSegmentQty(sb, dif / 6 | 0);
        }
        if (reverse && fillSafe !== false && !sb.reversed) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reverseSegment"])(sb);
        }
        shapeIndex = shapeIndices[i] || shapeIndices[i] === 0 ? shapeIndices[i] : "auto";
        if (shapeIndex) {
            // if the start shape is closed, find the closest point to the start/end, and re-organize the bezier points accordingly so that the shape morphs in a more intuitive way.
            if (sb.closed || Math.abs(sb[0] - sb[sb.length - 2]) < 0.5 && Math.abs(sb[1] - sb[sb.length - 1]) < 0.5) {
                if (shapeIndex === "auto" || shapeIndex === "log") {
                    shapeIndices[i] = shapeIndex = _getClosestShapeIndex(sb, eb, !i || fillSafe === false);
                    if (shapeIndex < 0) {
                        reverse = true;
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reverseSegment"])(sb);
                        shapeIndex = -shapeIndex;
                    }
                    _offsetSegment(sb, shapeIndex * 6);
                } else if (shapeIndex !== "reverse") {
                    if (i && shapeIndex < 0) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reverseSegment"])(sb);
                    }
                    _offsetSegment(sb, (shapeIndex < 0 ? -shapeIndex : shapeIndex) * 6);
                }
            // otherwise, if it's not a closed shape, consider reversing it if that would make the overall travel less
            } else if (!reverse && (shapeIndex === "auto" && Math.abs(eb[0] - sb[0]) + Math.abs(eb[1] - sb[1]) + Math.abs(eb[eb.length - 2] - sb[sb.length - 2]) + Math.abs(eb[eb.length - 1] - sb[sb.length - 1]) > Math.abs(eb[0] - sb[sb.length - 2]) + Math.abs(eb[1] - sb[sb.length - 1]) + Math.abs(eb[eb.length - 2] - sb[0]) + Math.abs(eb[eb.length - 1] - sb[1]) || shapeIndex % 2)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reverseSegment"])(sb);
                shapeIndices[i] = -1;
                reverse = true;
            } else if (shapeIndex === "auto") {
                shapeIndices[i] = 0;
            } else if (shapeIndex === "reverse") {
                shapeIndices[i] = -1;
            }
            if (sb.closed !== eb.closed) {
                sb.closed = eb.closed = false;
            }
        }
    }
    log && _log("shapeIndex:[" + shapeIndices.join(",") + "]");
    start.shapeIndex = shapeIndices;
    return shapeIndices;
}, _pathFilter = (a, shapeIndex, map, precompile, fillSafe)=>{
    let start = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringToRawPath"])(a[0]), end = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringToRawPath"])(a[1]);
    if (!_equalizeSegmentQuantity(start, end, shapeIndex || shapeIndex === 0 ? shapeIndex : "auto", map, fillSafe)) {
        return; // malformed path data or null target
    }
    a[0] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rawPathToString"])(start);
    a[1] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rawPathToString"])(end);
    (precompile === "log" || precompile === true) && _log('precompile:["' + a[0] + '","' + a[1] + '"]');
}, _offsetPoints = (text, offset)=>{
    if (!offset) {
        return text;
    }
    let a = text.match(_numExp) || [], l = a.length, s = "", inc, i, j;
    if (offset === "reverse") {
        i = l - 1;
        inc = -2;
    } else {
        i = ((parseInt(offset, 10) || 0) * 2 + 1 + l * 100) % l;
        inc = 2;
    }
    for(j = 0; j < l; j += 2){
        s += a[i - 1] + "," + a[i] + " ";
        i = (i + inc) % l;
    }
    return s;
}, // adds a certain number of points while maintaining the polygon/polyline shape (so that the start/end values can have a matching quantity of points to animate). Returns the revised string.
_equalizePointQuantity = (a, quantity)=>{
    let tally = 0, x = parseFloat(a[0]), y = parseFloat(a[1]), s = x + "," + y + " ", max = 0.999999, newPointsPerSegment, i, l, j, factor, nextX, nextY;
    l = a.length;
    newPointsPerSegment = quantity * 0.5 / (l * 0.5 - 1);
    for(i = 0; i < l - 2; i += 2){
        tally += newPointsPerSegment;
        nextX = parseFloat(a[i + 2]);
        nextY = parseFloat(a[i + 3]);
        if (tally > max) {
            factor = 1 / (Math.floor(tally) + 1);
            j = 1;
            while(tally > max){
                s += (x + (nextX - x) * factor * j).toFixed(2) + "," + (y + (nextY - y) * factor * j).toFixed(2) + " ";
                tally--;
                j++;
            }
        }
        s += nextX + "," + nextY + " ";
        x = nextX;
        y = nextY;
    }
    return s;
}, _pointsFilter = (a)=>{
    let startNums = a[0].match(_numExp) || [], endNums = a[1].match(_numExp) || [], dif = endNums.length - startNums.length;
    if (dif > 0) {
        a[0] = _equalizePointQuantity(startNums, dif);
    } else {
        a[1] = _equalizePointQuantity(endNums, -dif);
    }
}, _buildPointsFilter = (shapeIndex)=>!isNaN(shapeIndex) ? (a)=>{
        _pointsFilter(a);
        a[1] = _offsetPoints(a[1], parseInt(shapeIndex, 10));
    } : _pointsFilter, _parseShape = (shape, forcePath, target)=>{
    let isString = typeof shape === "string", e, type;
    if (!isString || _selectorExp.test(shape) || (shape.match(_numExp) || []).length < 3) {
        e = _toArray(shape)[0];
        if (e) {
            type = (e.nodeName + "").toUpperCase();
            if (forcePath && type !== "PATH") {
                e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["convertToPath"])(e, false);
                type = "PATH";
            }
            shape = e.getAttribute(type === "PATH" ? "d" : "points") || "";
            if (e === target) {
                shape = e.getAttributeNS(null, "data-original") || shape;
            }
        } else {
            _log("WARNING: invalid morph to: " + shape);
            shape = false;
        }
    }
    return shape;
}, // adds a "cpData" property to each segment that's an Array with the angle to each control point (in radians) and length so that we can maintain smooth anchors (interpolating the raw control point coordinates could lead to sharp angles in the middle). So [undefined, undefined, angle, length, angle, length, undefined, undefined, angle, length, angle, length, ...] (anchor slots are undefined)
_recordControlPointData = (rawPath)=>{
    let j = rawPath.length, segment, x, y, x2, y2, i, l, cpData;
    while(--j > -1){
        segment = rawPath[j];
        cpData = segment.cpData = segment.cpData || [];
        cpData.length = 0;
        l = segment.length - 2;
        for(i = 0; i < l; i += 6){
            x = segment[i] - segment[i + 2];
            y = segment[i + 1] - segment[i + 3];
            x2 = segment[i + 6] - segment[i + 4];
            y2 = segment[i + 7] - segment[i + 5];
            cpData[i + 2] = _atan2(y, x);
            cpData[i + 3] = _sqrt(x * x + y * y);
            cpData[i + 4] = _atan2(y2, x2);
            cpData[i + 5] = _sqrt(x2 * x2 + y2 * y2);
        }
    }
    return rawPath;
}, _parseOriginFactors = (v)=>{
    let a = v.trim().split(" "), x = ~v.indexOf("left") ? 0 : ~v.indexOf("right") ? 100 : isNaN(parseFloat(a[0])) ? 50 : parseFloat(a[0]), y = ~v.indexOf("top") ? 0 : ~v.indexOf("bottom") ? 100 : isNaN(parseFloat(a[1])) ? 50 : parseFloat(a[1]);
    return {
        x: x / 100,
        y: y / 100
    };
}, _shortAngle = (dif)=>dif !== dif % _PI ? dif + (dif < 0 ? _2PI : -_2PI) : dif, _morphMessage = "Use MorphSVGPlugin.convertToPath() to convert to a path before morphing.", _tweenRotation = function(start, end, i, linkedPT) {
    let so = this._origin, eo = this._eOrigin, dx = start[i] - so.x, dy = start[i + 1] - so.y, d = _sqrt(dx * dx + dy * dy), sa = _atan2(dy, dx), angleDif, short;
    dx = end[i] - eo.x;
    dy = end[i + 1] - eo.y;
    angleDif = _atan2(dy, dx) - sa;
    short = _shortAngle(angleDif);
    // in the case of control points, we ALWAYS link them to their anchor so that they don't get torn apart and rotate the opposite direction. If it's not a control point, we look at the most recently linked point as long as they're within a certain rotational range of each other.
    if (!linkedPT && _lastLinkedAnchor && Math.abs(short + _lastLinkedAnchor.ca) < _angleMin) {
        linkedPT = _lastLinkedAnchor;
    }
    return this._anchorPT = _lastLinkedAnchor = {
        _next: this._anchorPT,
        t: start,
        sa: sa,
        ca: linkedPT && short * linkedPT.ca < 0 && Math.abs(short) > _angleMax ? angleDif : short,
        sl: d,
        cl: _sqrt(dx * dx + dy * dy) - d,
        i: i
    };
}, _initCore = (required)=>{
    gsap = _getGSAP();
    PluginClass = PluginClass || gsap && gsap.plugins.morphSVG;
    if (gsap && PluginClass) {
        _toArray = gsap.utils.toArray;
        _reverting = gsap.core.reverting || function() {};
        _doc = document;
        PluginClass.prototype._tweenRotation = _tweenRotation;
        _coreInitted = 1;
    } else if (required) {
        _log("Please gsap.registerPlugin(MorphSVGPlugin)");
    }
};
const MorphSVGPlugin = {
    version: "3.15.0",
    name: "morphSVG",
    rawVars: 1,
    register (core, Plugin) {
        gsap = core;
        PluginClass = Plugin;
        _initCore();
    },
    init (target, value, tween, index, targets) {
        _coreInitted || _initCore(1);
        if (!value) {
            _log("invalid shape");
            return false;
        }
        _isFunction(value) && (value = value.call(tween, index, target, targets));
        let type, p, pt, shape, isPoly, shapeIndex, map, startCPData, endCPData, start, end, i, j, l, startSeg, endSeg, precompiled, originFactors, useRotation, curveMode;
        if (typeof value === "string" || value.getBBox || value[0]) {
            value = {
                shape: value
            };
        } else if (typeof value === "object") {
            type = {};
            for(p in value){
                type[p] = _isFunction(value[p]) && p !== "render" ? value[p].call(tween, index, target, targets) : value[p];
            }
            value = type;
        }
        let cs = target.nodeType ? window.getComputedStyle(target) : {}, fill = cs.fill + "", fillSafe = !(fill === "none" || (fill.match(_numExp) || [])[3] === "0" || cs.fillRule === "evenodd"), smooth = value.smooth, origins = (value.origin || "50 50").split(",");
        smooth === true || smooth === "auto" ? smooth = {} : typeof smooth === "number" && (smooth = {
            points: smooth
        });
        type = (target.nodeName + "").toUpperCase();
        isPoly = type === "POLYLINE" || type === "POLYGON";
        if (type !== "PATH" && !isPoly && !value.prop) {
            _log("Cannot morph a <" + type + "> element. " + _morphMessage);
            return false;
        }
        p = type === "PATH" ? "d" : "points";
        if (!value.prop && !_isFunction(target.setAttribute)) {
            return false;
        }
        shape = _parseShape(value.shape || value.d || value.points || "", p === "d", target);
        if (isPoly && _commands.test(shape)) {
            _log("A <" + type + "> cannot accept path data. " + _morphMessage);
            return false;
        }
        shapeIndex = value.shapeIndex || value.shapeIndex === 0 ? value.shapeIndex : "auto";
        map = value.map || MorphSVGPlugin.defaultMap;
        this._prop = value.prop;
        this._render = value.render || MorphSVGPlugin.defaultRender;
        this._apply = "updateTarget" in value ? value.updateTarget : MorphSVGPlugin.defaultUpdateTarget;
        this._rnd = Math.pow(10, isNaN(value.precision) ? 2 : +value.precision);
        this._tween = tween;
        if (shape) {
            this._target = target;
            precompiled = typeof value.precompile === "object";
            start = this._original = this._prop ? target[this._prop] : target.getAttribute(p);
            if (!this._prop && !target.getAttributeNS(null, "data-original")) {
                target.setAttributeNS(null, "data-original", start); // record the original state in a data-original attribute so that we can revert to it later.
            }
            if (p === "d" || this._prop) {
                start = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringToRawPath"])(precompiled ? value.precompile[0] : start);
                end = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringToRawPath"])(precompiled ? value.precompile[1] : shape);
                if (smooth) {
                    j = start.length;
                    while(--j){
                        _segmentCanBeIgnored(start[j]) && start.splice(j, 1);
                    }
                    _smoothRawPath(start, {
                        ...smooth,
                        points: +smooth.points || Math.max(_getDefaultSmoothPoints(start), _getDefaultSmoothPoints(end)),
                        maxSegments: end.length
                    });
                    _smoothRawPath(end, smooth.redraw === false ? smooth : {
                        ...smooth,
                        points: start
                    });
                }
                if (!precompiled && !_equalizeSegmentQuantity(start, end, shapeIndex, map, fillSafe)) {
                    return false; //malformed path data or null target
                }
                if (value.precompile === "log" || value.precompile === true) {
                    _log('precompile:["' + (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rawPathToString"])(start) + '","' + (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rawPathToString"])(end) + '"]');
                }
                useRotation = (value.type || MorphSVGPlugin.defaultType) !== "linear";
                curveMode = value.curveMode || useRotation; // curveMode means animating the angle and length of control points rather than the raw coordinates.
                _recordControlPointData(start);
                _recordControlPointData(end);
                if (useRotation) {
                    start.size || _getTotalSize(start); // adds top/left/width/height values
                    end.size || _getTotalSize(end);
                    originFactors = _parseOriginFactors(origins[0]);
                    this._origin = start.origin = {
                        x: start.left + originFactors.x * start.width,
                        y: start.top + originFactors.y * start.height
                    };
                    origins[1] && (originFactors = _parseOriginFactors(origins[1]));
                    this._eOrigin = {
                        x: end.left + originFactors.x * end.width,
                        y: end.top + originFactors.y * end.height
                    };
                }
                this._rawPath = target._gsRawPath = start;
                j = start.length;
                while(--j > -1){
                    startSeg = start[j];
                    endSeg = end[j];
                    startCPData = startSeg.cpData;
                    endCPData = endSeg.cpData;
                    l = startSeg.length;
                    _lastLinkedAnchor = 0; // reset; we use _lastLinkedAnchor in the _tweenRotation() method to help make sure that close points don't get ripped apart and rotate opposite directions. Typically we want to go the shortest direction, but if the previous anchor is going a different direction, we override this logic (within certain thresholds)
                    for(i = 0; i < l; i += 6){
                        if (endSeg[i] !== startSeg[i] || endSeg[i + 1] !== startSeg[i + 1]) {
                            if (useRotation) {
                                pt = this._tweenRotation(startSeg, endSeg, i);
                            } else {
                                pt = this.add(startSeg, i, startSeg[i], endSeg[i], 0, 0, 0, 0, 0, 1);
                                pt = this.add(startSeg, i + 1, startSeg[i + 1], endSeg[i + 1], 0, 0, 0, 0, 0, 1) || pt;
                            }
                        }
                    }
                    for(i = 0; i < l; i += 2){
                        if (curveMode && (startCPData[i] !== endCPData[i] || startCPData[i + 1] !== endCPData[i + 1]) && startCPData[i + 1] && endCPData[i + 1]) {
                            this._controlPT = {
                                _next: this._controlPT,
                                i: i,
                                j: j,
                                ai: i % 6 > 3 ? i + 2 : i - 2,
                                sa: startCPData[i],
                                ca: _shortAngle(endCPData[i] - startCPData[i]),
                                sl: startCPData[i + 1],
                                cl: endCPData[i + 1] - startCPData[i + 1]
                            };
                        } else {
                            endSeg[i] !== startSeg[i] && (pt = this.add(startSeg, i, startSeg[i], endSeg[i], 0, 0, 0, 0, 0, 1));
                            endSeg[i + 1] !== startSeg[i + 1] && (pt = this.add(startSeg, i + 1, startSeg[i + 1], endSeg[i + 1], 0, 0, 0, 0, 0, 1) || pt);
                        }
                    }
                }
            } else {
                pt = this.add(target, "setAttribute", target.getAttribute(p) + "", shape + "", index, targets, 0, _buildPointsFilter(shapeIndex), p);
            }
            if (useRotation) {
                this.add(this._origin, "x", this._origin.x, this._eOrigin.x, 0, 0, 0, 0, 0, 1);
                pt = this.add(this._origin, "y", this._origin.y, this._eOrigin.y, 0, 0, 0, 0, 0, 1);
            }
            if (pt) {
                this._props.push("morphSVG");
                pt.end = smooth && smooth.persist !== false ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rawPathToString"])(end) : shape;
                pt.endProp = p;
            }
        }
        return 1;
    },
    render (ratio, data) {
        let rawPath = data._rawPath, controlPT = data._controlPT, anchorPT = data._anchorPT, rnd = data._rnd, target = data._target, pt = data._pt, s, space, segment, l, angle, i, j, sin, cos;
        while(pt){
            pt.r(ratio, pt.d);
            pt = pt._next;
        }
        if (ratio === 1 && data._apply) {
            pt = data._pt;
            while(pt){
                if (pt.end) {
                    if (data._prop) {
                        target[data._prop] = pt.end;
                    } else {
                        target.setAttribute(pt.endProp, pt.end); // make sure the end value is exactly as specified (in case we had to add fabricated points during the tween)
                    }
                }
                pt = pt._next;
            }
        } else if (rawPath) {
            // rotationally position the anchors
            while(anchorPT){
                angle = anchorPT.sa + ratio * anchorPT.ca;
                l = anchorPT.sl + ratio * anchorPT.cl; // length
                anchorPT.t[anchorPT.i] = data._origin.x + _cos(angle) * l;
                anchorPT.t[anchorPT.i + 1] = data._origin.y + _sin(angle) * l;
                anchorPT = anchorPT._next;
            }
            while(controlPT){
                segment = rawPath[controlPT.j];
                i = controlPT.i;
                angle = controlPT.sa + ratio * controlPT.ca;
                sin = _sin(angle);
                cos = _cos(angle);
                l = controlPT.sl + ratio * controlPT.cl;
                segment[i] = segment[controlPT.ai] - cos * l;
                segment[i + 1] = segment[controlPT.ai + 1] - sin * l;
                controlPT = controlPT._next;
            }
            if (!ratio && _reverting()) {
                rawPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringToRawPath"])(data._original);
            }
            target._gsRawPath = rawPath;
            if (data._apply) {
                s = "";
                space = " ";
                for(j = 0; j < rawPath.length; j++){
                    segment = rawPath[j];
                    l = segment.length;
                    s += "M" + (segment[0] * rnd | 0) / rnd + space + (segment[1] * rnd | 0) / rnd + " C";
                    for(i = 2; i < l; i++){
                        s += (segment[i] * rnd | 0) / rnd + space;
                    }
                    segment.closed && (s += "z");
                }
                if (data._prop) {
                    target[data._prop] = s;
                } else {
                    target.setAttribute("d", s);
                }
            }
        }
        data._render && rawPath && data._render.call(data._tween, rawPath, target);
    },
    kill (property) {
        this._pt = this._rawPath = 0;
    },
    getRawPath: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRawPath"],
    stringToRawPath: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringToRawPath"],
    rawPathToString: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rawPathToString"],
    smoothRawPath: _smoothRawPath,
    normalizeStrings (shape1, shape2, { shapeIndex, map }) {
        let result = [
            shape1,
            shape2
        ];
        _pathFilter(result, shapeIndex, map);
        return result;
    },
    pathFilter: _pathFilter,
    pointsFilter: _pointsFilter,
    getTotalSize: _getTotalSize,
    equalizeSegmentQuantity: _equalizeSegmentQuantity,
    convertToPath: (targets, swap)=>_toArray(targets).map((target)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["convertToPath"])(target, swap !== false)),
    defaultType: "linear",
    defaultUpdateTarget: true,
    defaultMap: "size"
};
_getGSAP() && gsap.registerPlugin(MorphSVGPlugin);
;
}),
"[project]/apps/web/src/lib/gsap/src/ScrollSmoother.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollSmoother",
    ()=>ScrollSmoother,
    "default",
    ()=>ScrollSmoother
]);
/*!
 * ScrollSmoother 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ let gsap, _coreInitted, _win, _doc, _docEl, _body, _root, _toArray, _clamp, ScrollTrigger, _mainInstance, _expo, _getVelocityProp, _inputObserver, _context, _onResizeDelayedCall, _windowExists = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined", _getGSAP = ()=>gsap || _windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap, _bonusValidated = 1, _round = (value)=>Math.round(value * 100000) / 100000 || 0, _maxScroll = (scroller)=>ScrollTrigger.maxScroll(scroller || _win), _autoDistance = (el, progress)=>{
    let parent = el.parentNode || _docEl, b1 = el.getBoundingClientRect(), b2 = parent.getBoundingClientRect(), gapTop = b2.top - b1.top, gapBottom = b2.bottom - b1.bottom, change = (Math.abs(gapTop) > Math.abs(gapBottom) ? gapTop : gapBottom) / (1 - progress), offset = -change * progress, ratio, extraChange;
    if (change > 0) {
        ratio = b2.height / (_win.innerHeight + b2.height);
        extraChange = ratio === 0.5 ? b2.height * 2 : Math.min(b2.height, Math.abs(-change * ratio / (2 * ratio - 1))) * 2 * (progress || 1);
        offset += progress ? -extraChange * progress : -extraChange / 2; // whatever the offset, we must double that in the opposite direction to compensate.
        change += extraChange;
    }
    return {
        change,
        offset
    };
}, _wrap = (el)=>{
    let wrapper = _doc.querySelector(".ScrollSmoother-wrapper"); // some frameworks load multiple times, so one already exists, just use that to avoid duplicates
    if (!wrapper) {
        wrapper = _doc.createElement("div");
        wrapper.classList.add("ScrollSmoother-wrapper");
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
    }
    return wrapper;
};
class ScrollSmoother {
    constructor(vars){
        _coreInitted || ScrollSmoother.register(gsap) || console.warn("Please gsap.registerPlugin(ScrollSmoother)");
        vars = this.vars = vars || {};
        _mainInstance && _mainInstance.kill();
        _mainInstance = this;
        _context(this);
        let { smoothTouch, onUpdate, onStop, smooth, onFocusIn, normalizeScroll, wholePixels } = vars, content, wrapper, height, mainST, effects, sections, intervalID, wrapperCSS, contentCSS, paused, pausedNormalizer, recordedRefreshScroll, recordedRefreshScrub, allowUpdates, self = this, effectsPrefix = vars.effectsPrefix || "", scrollFunc = ScrollTrigger.getScrollFunc(_win), smoothDuration = ScrollTrigger.isTouch === 1 ? smoothTouch === true ? 0.8 : parseFloat(smoothTouch) || 0 : smooth === 0 || smooth === false ? 0 : parseFloat(smooth) || 0.8, speed = smoothDuration && +vars.speed || 1, currentY = 0, delta = 0, startupPhase = 1, tracker = _getVelocityProp(0), updateVelocity = ()=>tracker.update(-currentY), scroll = {
            y: 0
        }, removeScroll = ()=>content.style.overflow = "visible", isProxyScrolling, killScrub = (trigger)=>{
            trigger.update(); // it's possible that it hasn't been synchronized with the actual scroll position yet, like if it's later in the _triggers Array. If it was already updated, it'll skip the processing anyway.
            let scrub = trigger.getTween();
            if (scrub) {
                scrub.pause();
                scrub._time = scrub._dur; // force the playhead to completion without rendering just so that when it resumes, it doesn't jump back in the .resetTo().
                scrub._tTime = scrub._tDur;
            }
            isProxyScrolling = false;
            trigger.animation.progress(trigger.progress, true);
        }, render = (y, force)=>{
            if (y !== currentY && !paused || force) {
                wholePixels && (y = Math.round(y));
                if (smoothDuration) {
                    content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + y + ", 0, 1)";
                    //content.style.transform = "translateY(" + y + "px)"; // NOTE: when we used matrix3d() or set will-change: transform, it performed noticeably worse on iOS counter-intuitively!
                    content._gsap.y = y + "px";
                }
                delta = y - currentY;
                currentY = y;
                ScrollTrigger.isUpdating || ScrollSmoother.isRefreshing || ScrollTrigger.update(); // note: if we allowed an update() when in the middle of a refresh() it could render all the other ScrollTriggers and inside the update(), _refreshing would be true thus scrubs would jump instantly, but then on the very next update they'd continue from there. Basically this allowed update() to be called on OTHER ScrollTriggers during the refresh() of the mainST which could cause some complications. See https://gsap.com/forums/topic/35536-smoothscroller-ignoremobileresize-for-non-touch-devices
            }
        }, scrollTop = function(value) {
            if (arguments.length) {
                value < 0 && (value = 0);
                scroll.y = -value; // don't use currentY because we must accurately track the delta variable (in render() method)
                isProxyScrolling = true; // otherwise, if snapping was applied (or anything that attempted to SET the scroll proxy's scroll position), we'd set the scroll here which would then (on the next tick) update the content tween/ScrollTrigger which would try to smoothly animate to that new value, thus the scrub tween would impede the progress. So we use this flag to respond accordingly in the ScrollTrigger's onUpdate and effectively force the scrub to its end immediately.
                paused ? currentY = -value : render(-value);
                ScrollTrigger.isRefreshing ? mainST.update() : scrollFunc(value / speed); // during a refresh, we revert all scrollers to 0 and then put them back. We shouldn't force the window to that value too during the refresh.
                return this;
            }
            return -currentY;
        }, resizeObserver = typeof ResizeObserver !== "undefined" && vars.autoResize !== false && new ResizeObserver(()=>{
            if (!ScrollTrigger.isRefreshing) {
                let max = _maxScroll(wrapper) * speed;
                max < -currentY && scrollTop(max); // if the user scrolled down to the bottom, for example, and then the page resizes smaller, we should adjust things accordingly right away so that the scroll position isn't past the very end.
                _onResizeDelayedCall.restart(true);
            }
        }), lastFocusElement, _onFocusIn = (e)=>{
            wrapper.scrollTop = 0;
            if (e.target.contains && e.target.contains(wrapper) || onFocusIn && onFocusIn(this, e) === false) {
                return;
            }
            ScrollTrigger.isInViewport(e.target) || e.target === lastFocusElement || this.scrollTo(e.target, false, "center center");
            lastFocusElement = e.target;
        }, _transformPosition = (position, st)=>{
            if (position < st.start) {
                return position;
            }
            let ratio = isNaN(st.ratio) ? 1 : st.ratio, change = st.end - st.start, distance = position - st.start, offset = st.offset || 0, pins = st.pins || [], pinOffset = pins.offset || 0, progressOffset = st._startClamp && st.start <= 0 || st.pins && st.pins.offset ? 0 : st._endClamp && st.end === _maxScroll() ? 1 : 0.5;
            pins.forEach((p)=>{
                change -= p.distance;
                if (p.nativeStart <= position) {
                    distance -= p.distance;
                }
            });
            if (pinOffset) {
                distance *= (change - pinOffset / ratio) / change;
            }
            return position + (distance - offset * progressOffset) / ratio - distance;
        }, adjustEffectRelatedTriggers = (st, triggers, partial)=>{
            partial || (st.pins.length = st.pins.offset = 0);
            let pins = st.pins, markers = st.markers, dif, isClamped, start, end, nativeStart, nativeEnd, i, trig;
            for(i = 0; i < triggers.length; i++){
                trig = triggers[i];
                if (st.trigger && trig.trigger && st !== trig && (trig.trigger === st.trigger || trig.pinnedContainer === st.trigger || st.trigger.contains(trig.trigger))) {
                    nativeStart = trig._startNative || trig._startClamp || trig.start;
                    nativeEnd = trig._endNative || trig._endClamp || trig.end;
                    start = _transformPosition(nativeStart, st);
                    // note: _startClamp and _endClamp are populated with the unclamped values. For the sake of efficiency sake, we use the property both like a boolean to indicate that clamping is enabled AND the actual original unclamped value which we need in situations like if there's a data-speed="" on an element that has something like start="clamp(top bottom)". For in-viewport elements, it would clamp the values on the ScrollTrigger first, then feed it here and we'd adjust it on the clamped value which could throw things off - we need to apply the logic to the unclamped value and THEN re-apply clamping on the result.
                    end = trig.pin && nativeEnd > 0 ? start + (nativeEnd - nativeStart) : _transformPosition(nativeEnd, st);
                    trig.setPositions(start, end, true, (trig._startClamp ? Math.max(0, start) : start) - nativeStart); // the last value (pinOffset) is to adjust the pinStart y value inside ScrollTrigger to accommodate for the y offset that gets applied by the parallax effect.
                    trig.markerStart && markers.push(gsap.quickSetter([
                        trig.markerStart,
                        trig.markerEnd
                    ], "y", "px"));
                    if (trig.pin && trig.end > 0 && !partial) {
                        dif = trig.end - trig.start;
                        isClamped = st._startClamp && trig.start < 0;
                        if (isClamped) {
                            if (st.start > 0) {
                                st.setPositions(0, st.end + (st._startNative - st.start), true); // add the overlap amount
                                adjustEffectRelatedTriggers(st, triggers);
                                return; // start over for this trigger element!
                            }
                            dif += trig.start;
                            pins.offset = -trig.start; // edge case when a clamped effect starts mid-pin, we've gotta compensate in the onUpdate algorithm.
                        }
                        pins.push({
                            start: trig.start,
                            nativeStart,
                            end: trig.end,
                            distance: dif,
                            trig: trig
                        });
                        st.setPositions(st.start, st.end + (isClamped ? -trig.start : dif), true);
                    }
                }
            }
        }, adjustParallaxPosition = (triggers, createdAfterEffectWasApplied)=>{
            effects.forEach((st)=>adjustEffectRelatedTriggers(st, triggers, createdAfterEffectWasApplied));
        }, onRefresh = ()=>{
            _docEl = _doc.documentElement; // some frameworks like Astro may cache the <body> and replace it during routing, so we'll just re-record the _docEl and _body for safety (otherwise, the markers may not get added properly).
            _body = _doc.body;
            removeScroll();
            requestAnimationFrame(removeScroll);
            if (effects) {
                ScrollTrigger.getAll().forEach((st)=>{
                    st._startNative = st.start;
                    st._endNative = st.end;
                });
                effects.forEach((st)=>{
                    let start = st._startClamp || st.start, end = st.autoSpeed ? Math.min(_maxScroll(), st.end) : start + Math.abs((st.end - start) / st.ratio), offset = end - st.end; // we split the difference so that it reaches its natural position in the MIDDLE of the viewport
                    start -= offset / 2;
                    end -= offset / 2;
                    if (start > end) {
                        let s = start;
                        start = end;
                        end = s;
                    }
                    if (st._startClamp && start < 0) {
                        end = st.ratio < 0 ? _maxScroll() : st.end / st.ratio;
                        offset = end - st.end;
                        start = 0;
                    } else if (st.ratio < 0 || st._endClamp && end >= _maxScroll()) {
                        end = _maxScroll();
                        start = st.ratio < 0 ? 0 : st.ratio > 1 ? 0 : end - (end - st.start) / st.ratio;
                        offset = (end - start) * st.ratio - (st.end - st.start);
                    }
                    st.offset = offset || 0.0001; // we assign at least a tiny value because we check in the onUpdate for .offset being set in order to apply values.
                    st.pins.length = st.pins.offset = 0;
                    st.setPositions(start, end, true);
                // note: another way of getting only the amount of offset traveled for a certain ratio is: distanceBetweenStartAndEnd * (1 / ratio - 1)
                });
                adjustParallaxPosition(ScrollTrigger.sort());
            }
            tracker.reset();
        }, addOnRefresh = ()=>ScrollTrigger.addEventListener("refresh", onRefresh), restoreEffects = ()=>effects && effects.forEach((st)=>st.vars.onRefresh(st)), revertEffects = ()=>{
            effects && effects.forEach((st)=>st.vars.onRefreshInit(st));
            return restoreEffects;
        }, effectValueGetter = (name, value, index, el)=>{
            return ()=>{
                let v = typeof value === "function" ? value(index, el) : value;
                v || v === 0 || (v = el.getAttribute("data-" + effectsPrefix + name) || (name === "speed" ? 1 : 0));
                el.setAttribute("data-" + effectsPrefix + name, v);
                let clamp = (v + "").substr(0, 6) === "clamp(";
                return {
                    clamp,
                    value: clamp ? v.substr(6, v.length - 7) : v
                };
            };
        }, createEffect = (el, speed, lag, index, effectsPadding)=>{
            effectsPadding = (typeof effectsPadding === "function" ? effectsPadding(index, el) : effectsPadding) || 0;
            let getSpeed = effectValueGetter("speed", speed, index, el), getLag = effectValueGetter("lag", lag, index, el), startY = gsap.getProperty(el, "y"), cache = el._gsap, ratio, st, autoSpeed, scrub, progressOffset, yOffset, pins = [], initDynamicValues = ()=>{
                speed = getSpeed();
                lag = parseFloat(getLag().value);
                ratio = parseFloat(speed.value) || 1;
                autoSpeed = speed.value === "auto";
                progressOffset = autoSpeed || st && st._startClamp && st.start <= 0 || pins.offset ? 0 : st && st._endClamp && st.end === _maxScroll() ? 1 : 0.5;
                scrub && scrub.kill();
                scrub = lag && gsap.to(el, {
                    ease: _expo,
                    overwrite: false,
                    y: "+=0",
                    duration: lag
                });
                if (st) {
                    st.ratio = ratio;
                    st.autoSpeed = autoSpeed;
                }
            }, revert = ()=>{
                cache.y = startY + "px";
                cache.renderTransform(1);
                initDynamicValues();
            }, markers = [], change = 0, updateChange = (self)=>{
                if (autoSpeed) {
                    revert();
                    let auto = _autoDistance(el, _clamp(0, 1, -self.start / (self.end - self.start)));
                    change = auto.change;
                    yOffset = auto.offset;
                } else {
                    yOffset = pins.offset || 0;
                    change = (self.end - self.start - yOffset) * (1 - ratio);
                }
                pins.forEach((p)=>change -= p.distance * (1 - ratio));
                self.offset = change || 0.001;
                self.vars.onUpdate(self);
                scrub && scrub.progress(1);
            };
            initDynamicValues();
            if (ratio !== 1 || autoSpeed || scrub) {
                st = ScrollTrigger.create({
                    trigger: autoSpeed ? el.parentNode : el,
                    start: ()=>speed.clamp ? "clamp(top bottom+=" + effectsPadding + ")" : "top bottom+=" + effectsPadding,
                    end: ()=>speed.value < 0 ? "max" : speed.clamp ? "clamp(bottom top-=" + effectsPadding + ")" : "bottom top-=" + effectsPadding,
                    scroller: wrapper,
                    scrub: true,
                    refreshPriority: -999,
                    onRefreshInit: revert,
                    onRefresh: updateChange,
                    onKill: (self)=>{
                        let i = effects.indexOf(self);
                        i >= 0 && effects.splice(i, 1);
                        revert();
                    },
                    onUpdate: (self)=>{
                        let y = startY + change * (self.progress - progressOffset), i = pins.length, extraY = 0, pin, scrollY, end;
                        if (self.offset) {
                            if (i) {
                                scrollY = -currentY; // -scroll.y;
                                end = self.end;
                                while(i--){
                                    pin = pins[i];
                                    if (pin.trig.isActive || scrollY >= pin.start && scrollY <= pin.end) {
                                        if (scrub) {
                                            pin.trig.progress += pin.trig.direction < 0 ? 0.001 : -0.001; // just to make absolutely sure that it renders (if the progress didn't change, it'll skip)
                                            pin.trig.update(0, 0, 1);
                                            scrub.resetTo("y", parseFloat(cache.y), -delta, true);
                                            startupPhase && scrub.progress(1);
                                        }
                                        return;
                                    }
                                    scrollY > pin.end && (extraY += pin.distance);
                                    end -= pin.distance;
                                }
                                y = startY + extraY + change * ((gsap.utils.clamp(self.start, self.end, scrollY) - self.start - extraY) / (end - self.start) - progressOffset);
                            }
                            markers.length && !autoSpeed && markers.forEach((setter)=>setter(y - extraY));
                            y = _round(y + yOffset);
                            if (scrub) {
                                scrub.resetTo("y", y, -delta, true);
                                startupPhase && scrub.progress(1);
                            } else {
                                cache.y = y + "px";
                                cache.renderTransform(1);
                            }
                        }
                    }
                });
                updateChange(st);
                gsap.core.getCache(st.trigger).stRevert = revertEffects; // if user calls ScrollSmoother.create() with effects and THEN creates a ScrollTrigger on the same trigger element, the effect would throw off the start/end positions thus we needed a way to revert things when creating a new ScrollTrigger in that scenario, so we use this stRevert property of the GSCache inside ScrollTrigger.
                st.startY = startY;
                st.pins = pins;
                st.markers = markers;
                st.ratio = ratio;
                st.autoSpeed = autoSpeed;
                el.style.willChange = "transform";
            }
            return st;
        };
        addOnRefresh();
        ScrollTrigger.addEventListener("killAll", addOnRefresh);
        gsap.delayedCall(0.5, ()=>startupPhase = 0);
        this.scrollTop = scrollTop;
        this.scrollTo = (target, smooth, position)=>{
            let p = gsap.utils.clamp(0, _maxScroll(), isNaN(target) ? this.offset(target, position, !!smooth && !paused) : +target);
            !smooth ? scrollTop(p) : paused ? gsap.to(this, {
                duration: smoothDuration,
                scrollTop: p,
                overwrite: "auto",
                ease: _expo
            }) : scrollFunc(p);
        };
        this.offset = (target, position, ignoreSpeed)=>{
            target = _toArray(target)[0];
            let cssText = target.style.cssText, st = ScrollTrigger.create({
                trigger: target,
                start: position || "top top"
            }), y;
            if (effects) {
                startupPhase ? ScrollTrigger.refresh() : adjustParallaxPosition([
                    st
                ], true); // all the effects need to go through the initial full refresh() so that all the pins and ratios and offsets are set up. That's why we do a full refresh() if it's during the startupPhase.
            }
            y = st.start / (ignoreSpeed ? speed : 1);
            st.kill(false);
            target.style.cssText = cssText;
            gsap.core.getCache(target).uncache = 1;
            return y;
        };
        function refreshHeight() {
            height = content.clientHeight;
            content.style.overflow = "visible";
            _body.style.height = _win.innerHeight + (height - _win.innerHeight) / speed + "px";
            return height - _win.innerHeight;
        }
        this.content = function(element) {
            if (arguments.length) {
                let newContent = _toArray(element || "#smooth-content")[0] || console.warn("ScrollSmoother needs a valid content element.") || _body.children[0];
                if (newContent !== content) {
                    content = newContent;
                    contentCSS = content.getAttribute("style") || "";
                    resizeObserver && resizeObserver.observe(content);
                    gsap.set(content, {
                        overflow: "visible",
                        width: "100%",
                        boxSizing: "border-box",
                        y: "+=0"
                    });
                    smoothDuration || gsap.set(content, {
                        clearProps: "transform"
                    });
                }
                return this;
            }
            return content;
        };
        this.wrapper = function(element) {
            if (arguments.length) {
                wrapper = _toArray(element || "#smooth-wrapper")[0] || _wrap(content);
                wrapperCSS = wrapper.getAttribute("style") || "";
                refreshHeight();
                gsap.set(wrapper, smoothDuration ? {
                    overflow: "hidden",
                    position: "fixed",
                    height: "100%",
                    width: "100%",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                } : {
                    overflow: "visible",
                    position: "relative",
                    width: "100%",
                    height: "auto",
                    top: "auto",
                    bottom: "auto",
                    left: "auto",
                    right: "auto"
                });
                return this;
            }
            return wrapper;
        };
        this.effects = (targets, config)=>{
            effects || (effects = []);
            if (!targets) {
                return effects.slice(0);
            }
            targets = _toArray(targets);
            targets.forEach((target)=>{
                let i = effects.length;
                while(i--){
                    effects[i].trigger === target && effects[i].kill(); // will automatically splice() it from the effects Array in the onKill
                }
            });
            config = config || {};
            let { speed, lag, effectsPadding } = config, effectsToAdd = [], i, st;
            for(i = 0; i < targets.length; i++){
                st = createEffect(targets[i], speed, lag, i, effectsPadding);
                st && effectsToAdd.push(st);
            }
            effects.push(...effectsToAdd);
            config.refresh !== false && ScrollTrigger.refresh(); // certain effects require a refresh to work properly
            return effectsToAdd;
        };
        this.sections = (targets, config)=>{
            sections || (sections = []);
            if (!targets) {
                return sections.slice(0);
            }
            let newSections = _toArray(targets).map((el)=>ScrollTrigger.create({
                    trigger: el,
                    start: "top 120%",
                    end: "bottom -20%",
                    onToggle: (self)=>{
                        el.style.opacity = self.isActive ? "1" : "0";
                        el.style.pointerEvents = self.isActive ? "all" : "none";
                    }
                }));
            config && config.add ? sections.push(...newSections) : sections = newSections.slice(0);
            return newSections;
        };
        this.content(vars.content);
        this.wrapper(vars.wrapper);
        this.render = (y)=>render(y || y === 0 ? y : currentY);
        this.getVelocity = ()=>tracker.getVelocity(-currentY);
        ScrollTrigger.scrollerProxy(wrapper, {
            scrollTop: scrollTop,
            scrollHeight: ()=>refreshHeight() && _body.scrollHeight,
            fixedMarkers: vars.fixedMarkers !== false && !!smoothDuration,
            content: content,
            getBoundingClientRect () {
                return {
                    top: 0,
                    left: 0,
                    width: _win.innerWidth,
                    height: _win.innerHeight
                };
            }
        });
        ScrollTrigger.defaults({
            scroller: wrapper
        });
        let existingScrollTriggers = ScrollTrigger.getAll().filter((st)=>st.scroller === _win || st.scroller === wrapper);
        existingScrollTriggers.forEach((st)=>st.revert(true, true)); // in case it's in an environment like React where child components that have ScrollTriggers instantiate BEFORE the parent that does ScrollSmoother.create(...);
        mainST = ScrollTrigger.create({
            animation: gsap.fromTo(scroll, {
                y: ()=>{
                    allowUpdates = 0;
                    return 0;
                }
            }, {
                y: ()=>{
                    allowUpdates = 1;
                    return -refreshHeight();
                },
                immediateRender: false,
                ease: "none",
                data: "ScrollSmoother",
                duration: 100,
                onUpdate: function() {
                    if (allowUpdates) {
                        let force = isProxyScrolling;
                        if (force) {
                            killScrub(mainST);
                            scroll.y = currentY;
                        }
                        render(scroll.y, force);
                        updateVelocity();
                        onUpdate && !paused && onUpdate(self);
                    }
                }
            }),
            onRefreshInit: (self)=>{
                if (ScrollSmoother.isRefreshing) {
                    return;
                }
                ScrollSmoother.isRefreshing = true;
                if (effects) {
                    let pins = ScrollTrigger.getAll().filter((st)=>!!st.pin);
                    effects.forEach((st)=>{
                        if (!st.vars.pinnedContainer) {
                            pins.forEach((pinST)=>{
                                if (pinST.pin.contains(st.trigger)) {
                                    let v = st.vars;
                                    v.pinnedContainer = pinST.pin;
                                    st.vars = null; // otherwise, it'll self.kill(), triggering the onKill()
                                    st.init(v, st.animation);
                                }
                            });
                        }
                    });
                }
                let scrub = self.getTween();
                recordedRefreshScrub = scrub && scrub._end > scrub._dp._time; // don't use scrub.progress() < 1 because we may have called killScrub() recently in which case it'll report progress() as 1 when we were actually in the middle of a scrub. That's why we tap into the _end instead.
                recordedRefreshScroll = currentY;
                scroll.y = 0;
                if (smoothDuration) {
                    ScrollTrigger.isTouch === 1 && (wrapper.style.position = "absolute"); // Safari 16 has a major bug - if you set wrapper.scrollTop to 0 (even if it's already 0), it blocks the whole page from scrolling page non-scrollable! See https://bugs.webkit.org/show_bug.cgi?id=245300 and https://codepen.io/GreenSock/pen/YzLZVOz. Originally we set pointer-events: none on the wrapper temporarily, and set it back to all after setting scrollTop to 0, but that could cause mouseenter/mouseleave/etc. events to fire too, so we opted to set the position to absolute and then back to fixed after setting scrollTop.
                    wrapper.scrollTop = 0; // set wrapper.scrollTop to 0 because in some very rare situations, the browser will auto-set that, like if there's a hash in the link or changing focus to an off-screen input
                    ScrollTrigger.isTouch === 1 && (wrapper.style.position = "fixed");
                }
            },
            onRefresh: (self)=>{
                self.animation.invalidate(); // because pinnedContainers may have been found in ScrollTrigger's _refreshAll() that extend the height. Without this, it may prevent the user from being able to scroll all the way down.
                scroll.y = 0; // since we invalidated the tween, we must reset scroll.y to 0, otherwise when the tween inits it'll record the current scroll.y as the pre-fromTo(), thus when ScrollTrigger calls revert(), it'll set it back to that old value! See https://gsap.com/community/forums/topic/45138-scrollsmoother-stops-and-scrolltrigger-misaligned-in-browser-dev-tools/
                self.setPositions(self.start, refreshHeight() / speed);
                recordedRefreshScrub || killScrub(self);
                scroll.y = -scrollFunc() * speed; // in 3.11.1, we shifted to forcing the scroll position to 0 during the entire refreshAll() in ScrollTrigger and then restored the scroll position AFTER everything had been updated, thus we should always make these adjustments AFTER a full refresh rather than putting it in the onRefresh() of the individual mainST ScrollTrigger which would fire before the scroll position was restored.
                render(scroll.y);
                if (!startupPhase) {
                    recordedRefreshScrub && (isProxyScrolling = false); // otherwise, we lose any in-progress scrub. When we set the progress(), it fires the onUpdate() which sets the scroll position immediately (jumps ahead if isProxyScrolling is true). See https://gsap.com/community/forums/topic/37515-dynamic-scrolltrigger-with-pin-inside-a-scrollsmoother/
                    self.animation.progress(gsap.utils.clamp(0, 1, recordedRefreshScroll / speed / -self.end));
                }
                if (recordedRefreshScrub) {
                    self.progress -= 0.001;
                    self.update();
                }
                ScrollSmoother.isRefreshing = false;
            },
            id: "ScrollSmoother",
            scroller: _win,
            invalidateOnRefresh: true,
            start: 0,
            refreshPriority: -9999,
            end: ()=>refreshHeight() / speed,
            onScrubComplete: ()=>{
                tracker.reset();
                onStop && onStop(this);
            },
            scrub: smoothDuration || true
        });
        this.smooth = function(value) {
            if (arguments.length) {
                smoothDuration = value || 0;
                speed = smoothDuration && +vars.speed || 1;
                mainST.scrubDuration(value);
            }
            return mainST.getTween() ? mainST.getTween().duration() : 0;
        };
        mainST.getTween() && (mainST.getTween().vars.ease = vars.ease || _expo);
        this.scrollTrigger = mainST;
        vars.effects && this.effects(vars.effects === true ? "[data-" + effectsPrefix + "speed], [data-" + effectsPrefix + "lag]" : vars.effects, {
            effectsPadding: vars.effectsPadding,
            refresh: false
        });
        vars.sections && this.sections(vars.sections === true ? "[data-section]" : vars.sections);
        existingScrollTriggers.forEach((st)=>{
            st.vars.scroller = wrapper;
            st.revert(false, true);
            st.init(st.vars, st.animation);
        });
        this.paused = function(value, allowNestedScroll) {
            if (arguments.length) {
                if (!!paused !== value) {
                    if (value) {
                        mainST.getTween() && mainST.getTween().pause();
                        scrollFunc(-currentY / speed);
                        tracker.reset();
                        pausedNormalizer = ScrollTrigger.normalizeScroll();
                        pausedNormalizer && pausedNormalizer.disable(); // otherwise the normalizer would try to scroll the page on things like wheel events.
                        paused = ScrollTrigger.observe({
                            preventDefault: true,
                            type: "wheel,touch,scroll",
                            debounce: false,
                            allowClicks: true,
                            onChangeY: ()=>scrollTop(-currentY) // refuse to scroll
                        });
                        paused.nested = _inputObserver(_docEl, "wheel,touch,scroll", true, allowNestedScroll !== false); // allow nested scrolling, like modals
                    } else {
                        paused.nested.kill();
                        paused.kill();
                        paused = 0;
                        pausedNormalizer && pausedNormalizer.enable();
                        mainST.progress = (-currentY / speed - mainST.start) / (mainST.end - mainST.start);
                        killScrub(mainST);
                    }
                }
                return this;
            }
            return !!paused;
        };
        this.kill = this.revert = ()=>{
            this.paused(false);
            killScrub(mainST);
            mainST.kill();
            let triggers = (effects || []).concat(sections || []), i = triggers.length;
            while(i--){
                triggers[i].kill();
            }
            ScrollTrigger.scrollerProxy(wrapper);
            ScrollTrigger.removeEventListener("killAll", addOnRefresh);
            ScrollTrigger.removeEventListener("refresh", onRefresh);
            wrapper.style.cssText = wrapperCSS;
            content.style.cssText = contentCSS;
            let defaults = ScrollTrigger.defaults({});
            defaults && defaults.scroller === wrapper && ScrollTrigger.defaults({
                scroller: _win
            });
            this.normalizer && ScrollTrigger.normalizeScroll(false);
            clearInterval(intervalID);
            _mainInstance = null;
            resizeObserver && resizeObserver.disconnect();
            _body.style.removeProperty("height");
            _win.removeEventListener("focusin", _onFocusIn);
        };
        this.refresh = (soft, force)=>mainST.refresh(soft, force);
        if (normalizeScroll) {
            this.normalizer = ScrollTrigger.normalizeScroll(normalizeScroll === true ? {
                debounce: true,
                content: !smoothDuration && content
            } : normalizeScroll);
        }
        ScrollTrigger.config(vars); // in case user passes in ignoreMobileResize for example
        // ("overscrollBehavior" in _win.getComputedStyle(_body)) && gsap.set([_body, _docEl], {overscrollBehavior: "none"}); // this caused Safari 17+ not to scroll the entire page (bug in Safari), so let people set this in the CSS instead if they want.
        "scrollBehavior" in _win.getComputedStyle(_body) && gsap.set([
            _body,
            _docEl
        ], {
            scrollBehavior: "auto"
        });
        // if the user hits the tab key (or whatever) to shift focus to an element that's off-screen, center that element.
        _win.addEventListener("focusin", _onFocusIn);
        intervalID = setInterval(updateVelocity, 250);
        _doc.readyState === "loading" || requestAnimationFrame(()=>ScrollTrigger.refresh());
    }
    get progress() {
        return this.scrollTrigger ? this.scrollTrigger.animation._time / 100 : 0;
    }
    static register(core) {
        if (!_coreInitted) {
            gsap = core || _getGSAP();
            if (_windowExists() && window.document) //TURBOPACK unreachable
            ;
            if (gsap) {
                _toArray = gsap.utils.toArray;
                _clamp = gsap.utils.clamp;
                _expo = gsap.parseEase("expo");
                _context = gsap.core.context || function() {};
                ScrollTrigger = gsap.core.globals().ScrollTrigger;
                gsap.core.globals("ScrollSmoother", ScrollSmoother); // must register the global manually because in Internet Explorer, functions (classes) don't have a "name" property.
                if (_body && ScrollTrigger) {
                    _onResizeDelayedCall = gsap.delayedCall(0.2, ()=>ScrollTrigger.isRefreshing || _mainInstance && _mainInstance.refresh()).pause();
                    _root = [
                        _win,
                        _doc,
                        _docEl,
                        _body
                    ];
                    _getVelocityProp = ScrollTrigger.core._getVelocityProp;
                    _inputObserver = ScrollTrigger.core._inputObserver;
                    ScrollSmoother.refresh = ScrollTrigger.refresh;
                    _coreInitted = 1;
                }
            }
        }
        return _coreInitted;
    }
}
ScrollSmoother.version = "3.15.0";
ScrollSmoother.create = (vars)=>_mainInstance && vars && _mainInstance.content() === _toArray(vars.content)[0] ? _mainInstance : new ScrollSmoother(vars);
ScrollSmoother.get = ()=>_mainInstance;
_getGSAP() && gsap.registerPlugin(ScrollSmoother);
;
}),
"[project]/apps/web/src/lib/gsap/src/Draggable.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Draggable",
    ()=>Draggable,
    "default",
    ()=>Draggable
]);
/*!
 * Draggable 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
 */ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/matrix.js [app-ssr] (ecmascript)");
;
let gsap, _win, _doc, _docElement, _body, _tempDiv, _placeholderDiv, _coreInitted, _checkPrefix, _toArray, _supportsPassive, _isTouchDevice, _touchEventLookup, _isMultiTouching, _isAndroid, InertiaPlugin, _defaultCursor, _supportsPointer, _context, _getStyleSaver, _dragCount = 0, _windowExists = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined", _getGSAP = ()=>gsap || _windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap, _isFunction = (value)=>typeof value === "function", _isObject = (value)=>typeof value === "object", _isUndefined = (value)=>typeof value === "undefined", _emptyFunc = ()=>false, _transformProp = "transform", _transformOriginProp = "transformOrigin", _round = (value)=>Math.round(value * 10000) / 10000, _isArray = Array.isArray, _createElement = (type, ns)=>{
    let e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.
    return e.style ? e : _doc.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://gsap.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
}, _RAD2DEG = 180 / Math.PI, _bigNum = 1e20, _identityMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Matrix2D"](), _getTime = Date.now || (()=>new Date().getTime()), _renderQueue = [], _lookup = {}, _lookupCount = 0, _clickableTagExp = /^(?:a|input|textarea|button|select)$/i, _lastDragTime = 0, _temp1 = {}, _windowProxy = {}, _copy = (obj, factor)=>{
    let copy = {}, p;
    for(p in obj){
        copy[p] = factor ? obj[p] * factor : obj[p];
    }
    return copy;
}, _extend = (obj, defaults)=>{
    for(let p in defaults){
        if (!(p in obj)) {
            obj[p] = defaults[p];
        }
    }
    return obj;
}, _setTouchActionForAllDescendants = (elements, value)=>{
    let i = elements.length, children;
    while(i--){
        value ? elements[i].style.touchAction = value : elements[i].style.removeProperty("touch-action");
        children = elements[i].children;
        children && children.length && _setTouchActionForAllDescendants(children, value);
    }
}, _renderQueueTick = ()=>_renderQueue.forEach((func)=>func()), _addToRenderQueue = (func)=>{
    _renderQueue.push(func);
    if (_renderQueue.length === 1) {
        gsap.ticker.add(_renderQueueTick);
    }
}, _renderQueueTimeout = ()=>!_renderQueue.length && gsap.ticker.remove(_renderQueueTick), _removeFromRenderQueue = (func)=>{
    let i = _renderQueue.length;
    while(i--){
        if (_renderQueue[i] === func) {
            _renderQueue.splice(i, 1);
        }
    }
    gsap.to(_renderQueueTimeout, {
        overwrite: true,
        delay: 15,
        duration: 0,
        onComplete: _renderQueueTimeout,
        data: "_draggable"
    }); //remove the "tick" listener only after the render queue is empty for 15 seconds (to improve performance). Adding/removing it constantly for every click/touch wouldn't deliver optimal speed, and we also don't want the ticker to keep calling the render method when things are idle for long periods of time (we want to improve battery life on mobile devices).
}, _setDefaults = (obj, defaults)=>{
    for(let p in defaults){
        if (!(p in obj)) {
            obj[p] = defaults[p];
        }
    }
    return obj;
}, _addListener = (element, type, func, capture)=>{
    if (element.addEventListener) {
        let touchType = _touchEventLookup[type];
        capture = capture || (_supportsPassive ? {
            passive: false
        } : null);
        element.addEventListener(touchType || type, func, capture);
        touchType && type !== touchType && element.addEventListener(type, func, capture); //some browsers actually support both, so must we. But pointer events cover all.
    }
}, _removeListener = (element, type, func, capture)=>{
    if (element.removeEventListener) {
        let touchType = _touchEventLookup[type];
        element.removeEventListener(touchType || type, func, capture);
        touchType && type !== touchType && element.removeEventListener(type, func, capture);
    }
}, _preventDefault = (event)=>{
    event.preventDefault && event.preventDefault();
    event.preventManipulation && event.preventManipulation(); //for some Microsoft browsers
}, _hasTouchID = (list, ID)=>{
    let i = list.length;
    while(i--){
        if (list[i].identifier === ID) {
            return true;
        }
    }
}, _onMultiTouchDocumentEnd = (event)=>{
    _isMultiTouching = event.touches && _dragCount < event.touches.length;
    _removeListener(event.target, "touchend", _onMultiTouchDocumentEnd);
}, _onMultiTouchDocument = (event)=>{
    _isMultiTouching = event.touches && _dragCount < event.touches.length;
    _addListener(event.target, "touchend", _onMultiTouchDocumentEnd);
}, _getDocScrollTop = (doc)=>_win.pageYOffset || doc.scrollTop || doc.documentElement.scrollTop || doc.body.scrollTop || 0, _getDocScrollLeft = (doc)=>_win.pageXOffset || doc.scrollLeft || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0, _addScrollListener = (e, callback)=>{
    _addListener(e, "scroll", callback);
    if (!_isRoot(e.parentNode)) {
        _addScrollListener(e.parentNode, callback);
    }
}, _removeScrollListener = (e, callback)=>{
    _removeListener(e, "scroll", callback);
    if (!_isRoot(e.parentNode)) {
        _removeScrollListener(e.parentNode, callback);
    }
}, _isRoot = (e)=>!!(!e || e === _docElement || e.nodeType === 9 || e === _doc.body || e === _win || !e.nodeType || !e.parentNode), _getMaxScroll = (element, axis)=>{
    let dim = axis === "x" ? "Width" : "Height", scroll = "scroll" + dim, client = "client" + dim;
    return Math.max(0, _isRoot(element) ? Math.max(_docElement[scroll], _body[scroll]) - (_win["inner" + dim] || _docElement[client] || _body[client]) : element[scroll] - element[client]);
}, _recordMaxScrolls = (e, skipCurrent)=>{
    let x = _getMaxScroll(e, "x"), y = _getMaxScroll(e, "y");
    if (_isRoot(e)) {
        e = _windowProxy;
    } else {
        _recordMaxScrolls(e.parentNode, skipCurrent);
    }
    e._gsMaxScrollX = x;
    e._gsMaxScrollY = y;
    if (!skipCurrent) {
        e._gsScrollX = e.scrollLeft || 0;
        e._gsScrollY = e.scrollTop || 0;
    }
}, _setStyle = (element, property, value)=>{
    let style = element.style;
    if (!style) {
        return;
    }
    if (_isUndefined(style[property])) {
        property = _checkPrefix(property, element) || property;
    }
    if (value == null) {
        style.removeProperty && style.removeProperty(property.replace(/([A-Z])/g, "-$1").toLowerCase());
    } else {
        style[property] = value;
    }
}, _getComputedStyle = (element)=>_win.getComputedStyle(element instanceof Element ? element : element.host || (element.parentNode || {}).host || element), _tempRect = {}, _parseRect = (e)=>{
    if (e === _win) {
        _tempRect.left = _tempRect.top = 0;
        _tempRect.width = _tempRect.right = _docElement.clientWidth || e.innerWidth || _body.clientWidth || 0;
        _tempRect.height = _tempRect.bottom = (e.innerHeight || 0) - 20 < _docElement.clientHeight ? _docElement.clientHeight : e.innerHeight || _body.clientHeight || 0;
        return _tempRect;
    }
    let doc = e.ownerDocument || _doc, r = !_isUndefined(e.pageX) ? {
        left: e.pageX - _getDocScrollLeft(doc),
        top: e.pageY - _getDocScrollTop(doc),
        right: e.pageX - _getDocScrollLeft(doc) + 1,
        bottom: e.pageY - _getDocScrollTop(doc) + 1
    } : !e.nodeType && !_isUndefined(e.left) && !_isUndefined(e.top) ? e : _toArray(e)[0].getBoundingClientRect();
    if (_isUndefined(r.right) && !_isUndefined(r.width)) {
        r.right = r.left + r.width;
        r.bottom = r.top + r.height;
    } else if (_isUndefined(r.width)) {
        r = {
            width: r.right - r.left,
            height: r.bottom - r.top,
            right: r.right,
            left: r.left,
            bottom: r.bottom,
            top: r.top
        };
    }
    return r;
}, _dispatchEvent = (target, type, callbackName)=>{
    let vars = target.vars, callback = vars[callbackName], listeners = target._listeners[type], result;
    if (_isFunction(callback)) {
        result = callback.apply(vars.callbackScope || target, vars[callbackName + "Params"] || [
            target.pointerEvent
        ]);
    }
    if (listeners && target.dispatchEvent(type) === false) {
        result = false;
    }
    return result;
}, _getBounds = (target, context)=>{
    let e = _toArray(target)[0], top, left, offset;
    if (!e.nodeType && e !== _win) {
        if (!_isUndefined(target.left)) {
            offset = {
                x: 0,
                y: 0
            }; //_getOffsetTransformOrigin(context); //the bounds should be relative to the origin
            return {
                left: target.left - offset.x,
                top: target.top - offset.y,
                width: target.width,
                height: target.height
            };
        }
        left = target.min || target.minX || target.minRotation || 0;
        top = target.min || target.minY || 0;
        return {
            left: left,
            top: top,
            width: (target.max || target.maxX || target.maxRotation || 0) - left,
            height: (target.max || target.maxY || 0) - top
        };
    }
    return _getElementBounds(e, context);
}, _point1 = {}, _getElementBounds = (element, context)=>{
    context = _toArray(context)[0];
    let isSVG = element.getBBox && element.ownerSVGElement, doc = element.ownerDocument || _doc, left, right, top, bottom, matrix, p1, p2, p3, p4, bbox, width, height, cs;
    if (element === _win) {
        top = _getDocScrollTop(doc);
        left = _getDocScrollLeft(doc);
        right = left + (doc.documentElement.clientWidth || element.innerWidth || doc.body.clientWidth || 0);
        bottom = top + ((element.innerHeight || 0) - 20 < doc.documentElement.clientHeight ? doc.documentElement.clientHeight : element.innerHeight || doc.body.clientHeight || 0); //some browsers (like Firefox) ignore absolutely positioned elements, and collapse the height of the documentElement, so it could be 8px, for example, if you have just an absolutely positioned div. In that case, we use the innerHeight to resolve this.
    } else if (context === _win || _isUndefined(context)) {
        return element.getBoundingClientRect();
    } else {
        left = top = 0;
        if (isSVG) {
            bbox = element.getBBox();
            width = bbox.width;
            height = bbox.height;
        } else {
            if (element.viewBox && (bbox = element.viewBox.baseVal)) {
                left = bbox.x || 0;
                top = bbox.y || 0;
                width = bbox.width;
                height = bbox.height;
            }
            if (!width) {
                cs = _getComputedStyle(element);
                bbox = cs.boxSizing === "border-box";
                width = (parseFloat(cs.width) || element.clientWidth || 0) + (bbox ? 0 : parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth));
                height = (parseFloat(cs.height) || element.clientHeight || 0) + (bbox ? 0 : parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth));
            }
        }
        right = width;
        bottom = height;
    }
    if (element === context) {
        return {
            left: left,
            top: top,
            width: right - left,
            height: bottom - top
        };
    }
    matrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(context, true).multiply((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(element));
    p1 = matrix.apply({
        x: left,
        y: top
    });
    p2 = matrix.apply({
        x: right,
        y: top
    });
    p3 = matrix.apply({
        x: right,
        y: bottom
    });
    p4 = matrix.apply({
        x: left,
        y: bottom
    });
    left = Math.min(p1.x, p2.x, p3.x, p4.x);
    top = Math.min(p1.y, p2.y, p3.y, p4.y);
    return {
        left: left,
        top: top,
        width: Math.max(p1.x, p2.x, p3.x, p4.x) - left,
        height: Math.max(p1.y, p2.y, p3.y, p4.y) - top
    };
}, _parseInertia = (draggable, snap, max, min, factor, forceZeroVelocity)=>{
    let vars = {}, a, i, l;
    if (snap) {
        if (factor !== 1 && snap instanceof Array) {
            vars.end = a = [];
            l = snap.length;
            if (_isObject(snap[0])) {
                for(i = 0; i < l; i++){
                    a[i] = _copy(snap[i], factor);
                }
            } else {
                for(i = 0; i < l; i++){
                    a[i] = snap[i] * factor;
                }
            }
            max += 1.1; //allow 1.1 pixels of wiggle room when snapping in order to work around some browser inconsistencies in the way bounds are reported which can make them roughly a pixel off. For example, if "snap:[-$('#menu').width(), 0]" was defined and #menu had a wrapper that was used as the bounds, some browsers would be one pixel off, making the minimum -752 for example when snap was [-753,0], thus instead of snapping to -753, it would snap to 0 since -753 was below the minimum.
            min -= 1.1;
        } else if (_isFunction(snap)) {
            vars.end = (value)=>{
                let result = snap.call(draggable, value), copy, p;
                if (factor !== 1) {
                    if (_isObject(result)) {
                        copy = {};
                        for(p in result){
                            copy[p] = result[p] * factor;
                        }
                        result = copy;
                    } else {
                        result *= factor;
                    }
                }
                return result; //we need to ensure that we can scope the function call to the Draggable instance itself so that users can access important values like maxX, minX, maxY, minY, x, and y from within that function.
            };
        } else {
            vars.end = snap;
        }
    }
    if (max || max === 0) {
        vars.max = max;
    }
    if (min || min === 0) {
        vars.min = min;
    }
    if (forceZeroVelocity) {
        vars.velocity = 0;
    }
    return vars;
}, _isClickable = (element)=>{
    let data;
    return !element || !element.getAttribute || element === _body ? false : (data = element.getAttribute("data-clickable")) === "true" || data !== "false" && (_clickableTagExp.test(element.nodeName + "") || element.getAttribute("contentEditable") === "true") ? true : _isClickable(element.parentNode);
}, _setSelectable = (elements, selectable)=>{
    let i = elements.length, e;
    while(i--){
        e = elements[i];
        e.ondragstart = e.onselectstart = selectable ? null : _emptyFunc;
        gsap.set(e, {
            lazy: true,
            userSelect: selectable ? "text" : "none"
        });
    }
}, _isFixed = (element)=>{
    if (_getComputedStyle(element).position === "fixed") {
        return true;
    }
    element = element.parentNode;
    if (element && element.nodeType === 1) {
        return _isFixed(element);
    }
}, _supports3D, _addPaddingBR, //The ScrollProxy class wraps an element's contents into another div (we call it "content") that we either add padding when necessary or apply a translate3d() transform in order to overscroll (scroll past the boundaries). This allows us to simply set the scrollTop/scrollLeft (or top/left for easier reverse-axis orientation, which is what we do in Draggable) and it'll do all the work for us. For example, if we tried setting scrollTop to -100 on a normal DOM element, it wouldn't work - it'd look the same as setting it to 0, but if we set scrollTop of a ScrollProxy to -100, it'll give the correct appearance by either setting paddingTop of the wrapper to 100 or applying a 100-pixel translateY.
ScrollProxy = function(element, vars) {
    element = gsap.utils.toArray(element)[0];
    vars = vars || {};
    let content = document.createElement("div"), style = content.style, node = element.firstChild, offsetTop = 0, offsetLeft = 0, prevTop = element.scrollTop, prevLeft = element.scrollLeft, scrollWidth = element.scrollWidth, scrollHeight = element.scrollHeight, extraPadRight = 0, maxLeft = 0, maxTop = 0, elementWidth, elementHeight, contentHeight, nextNode, transformStart, transformEnd;
    if (_supports3D && vars.force3D !== false) {
        transformStart = "translate3d(";
        transformEnd = "px,0px)";
    } else if (_transformProp) {
        transformStart = "translate(";
        transformEnd = "px)";
    }
    this.scrollTop = function(value, force) {
        if (!arguments.length) {
            return -this.top();
        }
        this.top(-value, force);
    };
    this.scrollLeft = function(value, force) {
        if (!arguments.length) {
            return -this.left();
        }
        this.left(-value, force);
    };
    this.left = function(value, force) {
        if (!arguments.length) {
            return -(element.scrollLeft + offsetLeft);
        }
        let dif = element.scrollLeft - prevLeft, oldOffset = offsetLeft;
        if ((dif > 2 || dif < -2) && !force) {
            prevLeft = element.scrollLeft;
            gsap.killTweensOf(this, {
                left: 1,
                scrollLeft: 1
            });
            this.left(-prevLeft);
            if (vars.onKill) {
                vars.onKill();
            }
            return;
        }
        value = -value; //invert because scrolling works in the opposite direction
        if (value < 0) {
            offsetLeft = value - 0.5 | 0;
            value = 0;
        } else if (value > maxLeft) {
            offsetLeft = value - maxLeft | 0;
            value = maxLeft;
        } else {
            offsetLeft = 0;
        }
        if (offsetLeft || oldOffset) {
            if (!this._skip) {
                style[_transformProp] = transformStart + -offsetLeft + "px," + -offsetTop + transformEnd;
            }
            if (offsetLeft + extraPadRight >= 0) {
                style.paddingRight = offsetLeft + extraPadRight + "px";
            }
        }
        element.scrollLeft = value | 0;
        prevLeft = element.scrollLeft; //don't merge this with the line above because some browsers adjust the scrollLeft after it's set, so in order to be 100% accurate in tracking it, we need to ask the browser to report it.
    };
    this.top = function(value, force) {
        if (!arguments.length) {
            return -(element.scrollTop + offsetTop);
        }
        let dif = element.scrollTop - prevTop, oldOffset = offsetTop;
        if ((dif > 2 || dif < -2) && !force) {
            prevTop = element.scrollTop;
            gsap.killTweensOf(this, {
                top: 1,
                scrollTop: 1
            });
            this.top(-prevTop);
            if (vars.onKill) {
                vars.onKill();
            }
            return;
        }
        value = -value; //invert because scrolling works in the opposite direction
        if (value < 0) {
            offsetTop = value - 0.5 | 0;
            value = 0;
        } else if (value > maxTop) {
            offsetTop = value - maxTop | 0;
            value = maxTop;
        } else {
            offsetTop = 0;
        }
        if (offsetTop || oldOffset) {
            if (!this._skip) {
                style[_transformProp] = transformStart + -offsetLeft + "px," + -offsetTop + transformEnd;
            }
        }
        element.scrollTop = value | 0;
        prevTop = element.scrollTop;
    };
    this.maxScrollTop = ()=>maxTop;
    this.maxScrollLeft = ()=>maxLeft;
    this.disable = function() {
        node = content.firstChild;
        while(node){
            nextNode = node.nextSibling;
            element.appendChild(node);
            node = nextNode;
        }
        if (element === content.parentNode) {
            element.removeChild(content);
        }
    };
    this.enable = function() {
        node = element.firstChild;
        if (node === content) {
            return;
        }
        while(node){
            nextNode = node.nextSibling;
            content.appendChild(node);
            node = nextNode;
        }
        element.appendChild(content);
        this.calibrate();
    };
    this.calibrate = function(force) {
        let widthMatches = element.clientWidth === elementWidth, cs, x, y;
        prevTop = element.scrollTop;
        prevLeft = element.scrollLeft;
        if (widthMatches && element.clientHeight === elementHeight && content.offsetHeight === contentHeight && scrollWidth === element.scrollWidth && scrollHeight === element.scrollHeight && !force) {
            return; //no need to recalculate things if the width and height haven't changed.
        }
        if (offsetTop || offsetLeft) {
            x = this.left();
            y = this.top();
            this.left(-element.scrollLeft);
            this.top(-element.scrollTop);
        }
        cs = _getComputedStyle(element);
        //first, we need to remove any width constraints to see how the content naturally flows so that we can see if it's wider than the containing element. If so, we've got to record the amount of overage so that we can apply that as padding in order for browsers to correctly handle things. Then we switch back to a width of 100% (without that, some browsers don't flow the content correctly)
        if (!widthMatches || force) {
            style.display = "block";
            style.width = "auto";
            style.paddingRight = "0px";
            extraPadRight = Math.max(0, element.scrollWidth - element.clientWidth);
            //if the content is wider than the container, we need to add the paddingLeft and paddingRight in order for things to behave correctly.
            if (extraPadRight) {
                extraPadRight += parseFloat(cs.paddingLeft) + (_addPaddingBR ? parseFloat(cs.paddingRight) : 0);
            }
        }
        style.display = "inline-block";
        style.position = "relative";
        style.overflow = "visible";
        style.verticalAlign = "top";
        style.boxSizing = "content-box";
        style.width = "100%";
        style.paddingRight = extraPadRight + "px";
        //some browsers neglect to factor in the bottom padding when calculating the scrollHeight, so we need to add that padding to the content when that happens. Allow a 2px margin for error
        if (_addPaddingBR) {
            style.paddingBottom = cs.paddingBottom;
        }
        elementWidth = element.clientWidth;
        elementHeight = element.clientHeight;
        scrollWidth = element.scrollWidth;
        scrollHeight = element.scrollHeight;
        maxLeft = element.scrollWidth - elementWidth;
        maxTop = element.scrollHeight - elementHeight;
        contentHeight = content.offsetHeight;
        style.display = "block";
        if (x || y) {
            this.left(x);
            this.top(y);
        }
    };
    this.content = content;
    this.element = element;
    this._skip = false;
    this.enable();
}, _initCore = (required)=>{
    if (_windowExists() && document.body) //TURBOPACK unreachable
    ;
    if (gsap) {
        InertiaPlugin = gsap.plugins.inertia;
        _context = gsap.core.context || function() {};
        _checkPrefix = gsap.utils.checkPrefix;
        _transformProp = _checkPrefix(_transformProp);
        _transformOriginProp = _checkPrefix(_transformOriginProp);
        _toArray = gsap.utils.toArray;
        _getStyleSaver = gsap.core.getStyleSaver;
        _supports3D = !!_checkPrefix("perspective");
    } else if (required) {
        console.warn("Please gsap.registerPlugin(Draggable)");
    }
};
class EventDispatcher {
    constructor(target){
        this._listeners = {};
        this.target = target || this;
    }
    addEventListener(type, callback) {
        let list = this._listeners[type] || (this._listeners[type] = []);
        if (!~list.indexOf(callback)) {
            list.push(callback);
        }
    }
    removeEventListener(type, callback) {
        let list = this._listeners[type], i = list && list.indexOf(callback);
        i >= 0 && list.splice(i, 1);
    }
    dispatchEvent(type) {
        let result;
        (this._listeners[type] || []).forEach((callback)=>callback.call(this, {
                type: type,
                target: this.target
            }) === false && (result = false));
        return result; //if any of the callbacks return false, pass that along.
    }
}
class Draggable extends EventDispatcher {
    constructor(target, vars){
        super();
        _coreInitted || _initCore(1);
        target = _toArray(target)[0]; //in case the target is a selector object or selector text
        this.styles = _getStyleSaver && _getStyleSaver(target, "transform,left,top");
        if (!InertiaPlugin) {
            InertiaPlugin = gsap.plugins.inertia;
        }
        this.vars = vars = _copy(vars || {});
        this.target = target;
        this.x = this.y = this.rotation = 0;
        this.dragResistance = parseFloat(vars.dragResistance) || 0;
        this.edgeResistance = isNaN(vars.edgeResistance) ? 1 : parseFloat(vars.edgeResistance) || 0;
        this.lockAxis = vars.lockAxis;
        this.autoScroll = vars.autoScroll || 0;
        this.lockedAxis = null;
        this.allowEventDefault = !!vars.allowEventDefault;
        gsap.getProperty(target, "x"); // to ensure that transforms are instantiated.
        let type = (vars.type || "x,y").toLowerCase(), xyMode = ~type.indexOf("x") || ~type.indexOf("y"), rotationMode = type.indexOf("rotation") !== -1, xProp = rotationMode ? "rotation" : xyMode ? "x" : "left", yProp = xyMode ? "y" : "top", allowX = !!(~type.indexOf("x") || ~type.indexOf("left") || type === "scroll"), allowY = !!(~type.indexOf("y") || ~type.indexOf("top") || type === "scroll"), minimumMovement = vars.minimumMovement || 2, self = this, triggers = _toArray(vars.trigger || vars.handle || target), killProps = {}, dragEndTime = 0, checkAutoScrollBounds = false, autoScrollMarginTop = vars.autoScrollMarginTop || 40, autoScrollMarginRight = vars.autoScrollMarginRight || 40, autoScrollMarginBottom = vars.autoScrollMarginBottom || 40, autoScrollMarginLeft = vars.autoScrollMarginLeft || 40, isClickable = vars.clickableTest || _isClickable, clickTime = 0, gsCache = target._gsap || gsap.core.getCache(target), isFixed = _isFixed(target), getPropAsNum = (property, unit)=>parseFloat(gsCache.get(target, property, unit)), ownerDoc = target.ownerDocument || _doc, enabled, scrollProxy, startPointerX, startPointerY, startElementX, startElementY, hasBounds, hasDragCallback, hasMoveCallback, maxX, minX, maxY, minY, touch, touchID, rotationOrigin, dirty, old, snapX, snapY, snapXY, isClicking, touchEventTarget, matrix, interrupted, allowNativeTouchScrolling, touchDragAxis, isDispatching, clickDispatch, trustedClickDispatch, isPreventingDefault, innerMatrix, dragged, onContextMenu = (e)=>{
            // (self.isPressed && e.which < 2) && self.endDrag() // previously ended drag when context menu was triggered, but instead we should just stop propagation and prevent the default event behavior.
            _preventDefault(e);
            e.stopImmediatePropagation && e.stopImmediatePropagation();
            return false;
        }, //this method gets called on every tick of TweenLite.ticker which allows us to synchronize the renders to the core engine (which is typically synchronized with the display refresh via requestAnimationFrame). This is an optimization - it's better than applying the values inside the "mousemove" or "touchmove" event handler which may get called many times inbetween refreshes.
        render = (suppressEvents)=>{
            if (self.autoScroll && self.isDragging && (checkAutoScrollBounds || dirty)) {
                let e = target, autoScrollFactor = self.autoScroll * 15, parent, isRoot, rect, pointerX, pointerY, changeX, changeY, gap;
                checkAutoScrollBounds = false;
                _windowProxy.scrollTop = _win.pageYOffset != null ? _win.pageYOffset : ownerDoc.documentElement.scrollTop != null ? ownerDoc.documentElement.scrollTop : ownerDoc.body.scrollTop;
                _windowProxy.scrollLeft = _win.pageXOffset != null ? _win.pageXOffset : ownerDoc.documentElement.scrollLeft != null ? ownerDoc.documentElement.scrollLeft : ownerDoc.body.scrollLeft;
                pointerX = self.pointerX - _windowProxy.scrollLeft;
                pointerY = self.pointerY - _windowProxy.scrollTop;
                while(e && !isRoot){
                    isRoot = _isRoot(e.parentNode);
                    parent = isRoot ? _windowProxy : e.parentNode;
                    rect = isRoot ? {
                        bottom: Math.max(_docElement.clientHeight, _win.innerHeight || 0),
                        right: Math.max(_docElement.clientWidth, _win.innerWidth || 0),
                        left: 0,
                        top: 0
                    } : parent.getBoundingClientRect();
                    changeX = changeY = 0;
                    if (allowY) {
                        gap = parent._gsMaxScrollY - parent.scrollTop;
                        if (gap < 0) {
                            changeY = gap;
                        } else if (pointerY > rect.bottom - autoScrollMarginBottom && gap) {
                            checkAutoScrollBounds = true;
                            changeY = Math.min(gap, autoScrollFactor * (1 - Math.max(0, rect.bottom - pointerY) / autoScrollMarginBottom) | 0);
                        } else if (pointerY < rect.top + autoScrollMarginTop && parent.scrollTop) {
                            checkAutoScrollBounds = true;
                            changeY = -Math.min(parent.scrollTop, autoScrollFactor * (1 - Math.max(0, pointerY - rect.top) / autoScrollMarginTop) | 0);
                        }
                        if (changeY) {
                            parent.scrollTop += changeY;
                        }
                    }
                    if (allowX) {
                        gap = parent._gsMaxScrollX - parent.scrollLeft;
                        if (gap < 0) {
                            changeX = gap;
                        } else if (pointerX > rect.right - autoScrollMarginRight && gap) {
                            checkAutoScrollBounds = true;
                            changeX = Math.min(gap, autoScrollFactor * (1 - Math.max(0, rect.right - pointerX) / autoScrollMarginRight) | 0);
                        } else if (pointerX < rect.left + autoScrollMarginLeft && parent.scrollLeft) {
                            checkAutoScrollBounds = true;
                            changeX = -Math.min(parent.scrollLeft, autoScrollFactor * (1 - Math.max(0, pointerX - rect.left) / autoScrollMarginLeft) | 0);
                        }
                        if (changeX) {
                            parent.scrollLeft += changeX;
                        }
                    }
                    if (isRoot && (changeX || changeY)) {
                        _win.scrollTo(parent.scrollLeft, parent.scrollTop);
                        setPointerPosition(self.pointerX + changeX, self.pointerY + changeY);
                    }
                    e = parent;
                }
            }
            if (dirty) {
                let { x, y } = self;
                if (rotationMode) {
                    self.deltaX = x - parseFloat(gsCache.rotation);
                    self.rotation = x;
                    gsCache.rotation = x + "deg";
                    gsCache.renderTransform(1, gsCache);
                } else {
                    if (scrollProxy) {
                        if (allowY) {
                            self.deltaY = y - scrollProxy.top();
                            scrollProxy.top(y);
                        }
                        if (allowX) {
                            self.deltaX = x - scrollProxy.left();
                            scrollProxy.left(x);
                        }
                    } else if (xyMode) {
                        if (allowY) {
                            self.deltaY = y - parseFloat(gsCache.y);
                            gsCache.y = y + "px";
                        }
                        if (allowX) {
                            self.deltaX = x - parseFloat(gsCache.x);
                            gsCache.x = x + "px";
                        }
                        gsCache.renderTransform(1, gsCache);
                    } else {
                        if (allowY) {
                            self.deltaY = y - parseFloat(target.style.top || 0);
                            target.style.top = y + "px";
                        }
                        if (allowX) {
                            self.deltaX = x - parseFloat(target.style.left || 0);
                            target.style.left = x + "px";
                        }
                    }
                }
                if (hasDragCallback && !suppressEvents && !isDispatching) {
                    isDispatching = true; //in case onDrag has an update() call (avoid endless loop)
                    if (_dispatchEvent(self, "drag", "onDrag") === false) {
                        if (allowX) {
                            self.x -= self.deltaX;
                        }
                        if (allowY) {
                            self.y -= self.deltaY;
                        }
                        render(true);
                    }
                    isDispatching = false;
                }
            }
            dirty = false;
        }, //copies the x/y from the element (whether that be transforms, top/left, or ScrollProxy's top/left) to the Draggable's x and y (and rotation if necessary) properties so that they reflect reality and it also (optionally) applies any snapping necessary. This is used by the InertiaPlugin tween in an onUpdate to ensure things are synced and snapped.
        syncXY = (skipOnUpdate, skipSnap)=>{
            let { x, y } = self, snappedValue, cs;
            if (!target._gsap) {
                gsCache = gsap.core.getCache(target);
            }
            gsCache.uncache && gsap.getProperty(target, "x"); // trigger a re-cache
            if (xyMode) {
                self.x = parseFloat(gsCache.x);
                self.y = parseFloat(gsCache.y);
            } else if (rotationMode) {
                self.x = self.rotation = _round(parseFloat(gsCache.rotation));
            } else if (scrollProxy) {
                self.y = scrollProxy.top();
                self.x = scrollProxy.left();
            } else {
                self.y = parseFloat(target.style.top || (cs = _getComputedStyle(target)) && cs.top) || 0;
                self.x = parseFloat(target.style.left || (cs || {}).left) || 0;
            }
            if ((snapX || snapY || snapXY) && !skipSnap && (self.isDragging || self.isThrowing)) {
                if (snapXY) {
                    _temp1.x = self.x;
                    _temp1.y = self.y;
                    snappedValue = snapXY(_temp1);
                    if (snappedValue.x !== self.x) {
                        self.x = snappedValue.x;
                        dirty = true;
                    }
                    if (snappedValue.y !== self.y) {
                        self.y = snappedValue.y;
                        dirty = true;
                    }
                }
                if (snapX) {
                    snappedValue = snapX(self.x);
                    if (snappedValue !== self.x) {
                        self.x = snappedValue;
                        if (rotationMode) {
                            self.rotation = snappedValue;
                        }
                        dirty = true;
                    }
                }
                if (snapY) {
                    snappedValue = snapY(self.y);
                    if (snappedValue !== self.y) {
                        self.y = snappedValue;
                    }
                    dirty = true;
                }
            }
            dirty && render(true);
            if (!skipOnUpdate) {
                self.deltaX = self.x - x;
                self.deltaY = self.y - y;
                _dispatchEvent(self, "throwupdate", "onThrowUpdate");
            }
        }, buildSnapFunc = (snap, min, max, factor)=>{
            if (min == null) {
                min = -_bigNum;
            }
            if (max == null) {
                max = _bigNum;
            }
            if (_isFunction(snap)) {
                return (n)=>{
                    let edgeTolerance = !self.isPressed ? 1 : 1 - self.edgeResistance; //if we're tweening, disable the edgeTolerance because it's already factored into the tweening values (we don't want to apply it multiple times)
                    return snap.call(self, (n > max ? max + (n - max) * edgeTolerance : n < min ? min + (n - min) * edgeTolerance : n) * factor) * factor;
                };
            }
            if (_isArray(snap)) {
                return (n)=>{
                    let i = snap.length, closest = 0, absDif = _bigNum, val, dif;
                    while(--i > -1){
                        val = snap[i];
                        dif = val - n;
                        if (dif < 0) {
                            dif = -dif;
                        }
                        if (dif < absDif && val >= min && val <= max) {
                            closest = i;
                            absDif = dif;
                        }
                    }
                    return snap[closest];
                };
            }
            return isNaN(snap) ? (n)=>n : ()=>snap * factor;
        }, buildPointSnapFunc = (snap, minX, maxX, minY, maxY, radius, factor)=>{
            radius = radius && radius < _bigNum ? radius * radius : _bigNum; //so we don't have to Math.sqrt() in the functions. Performance optimization.
            if (_isFunction(snap)) {
                return (point)=>{
                    let edgeTolerance = !self.isPressed ? 1 : 1 - self.edgeResistance, x = point.x, y = point.y, result, dx, dy; //if we're tweening, disable the edgeTolerance because it's already factored into the tweening values (we don't want to apply it multiple times)
                    point.x = x = x > maxX ? maxX + (x - maxX) * edgeTolerance : x < minX ? minX + (x - minX) * edgeTolerance : x;
                    point.y = y = y > maxY ? maxY + (y - maxY) * edgeTolerance : y < minY ? minY + (y - minY) * edgeTolerance : y;
                    result = snap.call(self, point);
                    if (result !== point) {
                        point.x = result.x;
                        point.y = result.y;
                    }
                    if (factor !== 1) {
                        point.x *= factor;
                        point.y *= factor;
                    }
                    if (radius < _bigNum) {
                        dx = point.x - x;
                        dy = point.y - y;
                        if (dx * dx + dy * dy > radius) {
                            point.x = x;
                            point.y = y;
                        }
                    }
                    return point;
                };
            }
            if (_isArray(snap)) {
                return (p)=>{
                    let i = snap.length, closest = 0, minDist = _bigNum, x, y, point, dist;
                    while(--i > -1){
                        point = snap[i];
                        x = point.x - p.x;
                        y = point.y - p.y;
                        dist = x * x + y * y;
                        if (dist < minDist) {
                            closest = i;
                            minDist = dist;
                        }
                    }
                    return minDist <= radius ? snap[closest] : p;
                };
            }
            return (n)=>n;
        }, calculateBounds = ()=>{
            let bounds, targetBounds, snap, snapIsRaw;
            hasBounds = false;
            if (scrollProxy) {
                scrollProxy.calibrate();
                self.minX = minX = -scrollProxy.maxScrollLeft();
                self.minY = minY = -scrollProxy.maxScrollTop();
                self.maxX = maxX = self.maxY = maxY = 0;
                hasBounds = true;
            } else if (!!vars.bounds) {
                bounds = _getBounds(vars.bounds, target.parentNode); //could be a selector/jQuery object or a DOM element or a generic object like {top:0, left:100, width:1000, height:800} or {minX:100, maxX:1100, minY:0, maxY:800}
                if (rotationMode) {
                    self.minX = minX = bounds.left;
                    self.maxX = maxX = bounds.left + bounds.width;
                    self.minY = minY = self.maxY = maxY = 0;
                } else if (!_isUndefined(vars.bounds.maxX) || !_isUndefined(vars.bounds.maxY)) {
                    bounds = vars.bounds;
                    self.minX = minX = bounds.minX;
                    self.minY = minY = bounds.minY;
                    self.maxX = maxX = bounds.maxX;
                    self.maxY = maxY = bounds.maxY;
                } else {
                    targetBounds = _getBounds(target, target.parentNode);
                    self.minX = minX = Math.round(getPropAsNum(xProp, "px") + bounds.left - targetBounds.left);
                    self.minY = minY = Math.round(getPropAsNum(yProp, "px") + bounds.top - targetBounds.top);
                    self.maxX = maxX = Math.round(minX + (bounds.width - targetBounds.width));
                    self.maxY = maxY = Math.round(minY + (bounds.height - targetBounds.height));
                }
                if (minX > maxX) {
                    self.minX = maxX;
                    self.maxX = maxX = minX;
                    minX = self.minX;
                }
                if (minY > maxY) {
                    self.minY = maxY;
                    self.maxY = maxY = minY;
                    minY = self.minY;
                }
                if (rotationMode) {
                    self.minRotation = minX;
                    self.maxRotation = maxX;
                }
                hasBounds = true;
            }
            if (vars.liveSnap) {
                snap = vars.liveSnap === true ? vars.snap || {} : vars.liveSnap;
                snapIsRaw = _isArray(snap) || _isFunction(snap);
                if (rotationMode) {
                    snapX = buildSnapFunc(snapIsRaw ? snap : snap.rotation, minX, maxX, 1);
                    snapY = null;
                } else {
                    if (snap.points) {
                        snapXY = buildPointSnapFunc(snapIsRaw ? snap : snap.points, minX, maxX, minY, maxY, snap.radius, scrollProxy ? -1 : 1);
                    } else {
                        if (allowX) {
                            snapX = buildSnapFunc(snapIsRaw ? snap : snap.x || snap.left || snap.scrollLeft, minX, maxX, scrollProxy ? -1 : 1);
                        }
                        if (allowY) {
                            snapY = buildSnapFunc(snapIsRaw ? snap : snap.y || snap.top || snap.scrollTop, minY, maxY, scrollProxy ? -1 : 1);
                        }
                    }
                }
            }
        }, onThrowComplete = ()=>{
            self.isThrowing = false;
            _dispatchEvent(self, "throwcomplete", "onThrowComplete");
        }, onThrowInterrupt = ()=>{
            self.isThrowing = false;
        }, animate = (inertia, forceZeroVelocity)=>{
            let snap, snapIsRaw, tween, overshootTolerance;
            if (inertia && InertiaPlugin) {
                if (inertia === true) {
                    snap = vars.snap || vars.liveSnap || {};
                    snapIsRaw = _isArray(snap) || _isFunction(snap);
                    inertia = {
                        resistance: (vars.throwResistance || vars.resistance || 1000) / (rotationMode ? 10 : 1)
                    };
                    if (rotationMode) {
                        inertia.rotation = _parseInertia(self, snapIsRaw ? snap : snap.rotation, maxX, minX, 1, forceZeroVelocity);
                    } else {
                        if (allowX) {
                            inertia[xProp] = _parseInertia(self, snapIsRaw ? snap : snap.points || snap.x || snap.left, maxX, minX, scrollProxy ? -1 : 1, forceZeroVelocity || self.lockedAxis === "x");
                        }
                        if (allowY) {
                            inertia[yProp] = _parseInertia(self, snapIsRaw ? snap : snap.points || snap.y || snap.top, maxY, minY, scrollProxy ? -1 : 1, forceZeroVelocity || self.lockedAxis === "y");
                        }
                        if (snap.points || _isArray(snap) && _isObject(snap[0])) {
                            inertia.linkedProps = xProp + "," + yProp;
                            inertia.radius = snap.radius; //note: we also disable liveSnapping while throwing if there's a "radius" defined, otherwise it looks weird to have the item thrown past a snapping point but live-snapping mid-tween. We do this by altering the onUpdateParams so that "skipSnap" parameter is true for syncXY.
                        }
                    }
                }
                self.isThrowing = true;
                overshootTolerance = !isNaN(vars.overshootTolerance) ? vars.overshootTolerance : vars.edgeResistance === 1 ? 0 : 1 - self.edgeResistance + 0.2;
                if (!inertia.duration) {
                    inertia.duration = {
                        max: Math.max(vars.minDuration || 0, "maxDuration" in vars ? vars.maxDuration : 2),
                        min: !isNaN(vars.minDuration) ? vars.minDuration : overshootTolerance === 0 || _isObject(inertia) && inertia.resistance > 1000 ? 0 : 0.5,
                        overshoot: overshootTolerance
                    };
                }
                self.tween = tween = gsap.to(scrollProxy || target, {
                    inertia: inertia,
                    data: "_draggable",
                    inherit: false,
                    onComplete: onThrowComplete,
                    onInterrupt: onThrowInterrupt,
                    onUpdate: vars.fastMode ? _dispatchEvent : syncXY,
                    onUpdateParams: vars.fastMode ? [
                        self,
                        "onthrowupdate",
                        "onThrowUpdate"
                    ] : snap && snap.radius ? [
                        false,
                        true
                    ] : []
                });
                if (!vars.fastMode) {
                    if (scrollProxy) {
                        scrollProxy._skip = true; // Microsoft browsers have a bug that causes them to briefly render the position incorrectly (it flashes to the end state when we seek() the tween even though we jump right back to the current position, and this only seems to happen when we're affecting both top and left), so we set a _suspendTransforms flag to prevent it from actually applying the values in the ScrollProxy.
                    }
                    tween.render(1e9, true, true); // force to the end. Remember, the duration will likely change upon initting because that's when InertiaPlugin calculates it.
                    syncXY(true, true);
                    self.endX = self.x;
                    self.endY = self.y;
                    if (rotationMode) {
                        self.endRotation = self.x;
                    }
                    tween.play(0);
                    syncXY(true, true);
                    if (scrollProxy) {
                        scrollProxy._skip = false; //Microsoft browsers have a bug that causes them to briefly render the position incorrectly (it flashes to the end state when we seek() the tween even though we jump right back to the current position, and this only seems to happen when we're affecting both top and left), so we set a _suspendTransforms flag to prevent it from actually applying the values in the ScrollProxy.
                    }
                }
            } else if (hasBounds) {
                self.applyBounds();
            }
        }, updateMatrix = (shiftStart)=>{
            let start = matrix, p;
            matrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(target.parentNode, true);
            if (shiftStart && self.isPressed && !matrix.equals(start || new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Matrix2D"]())) {
                p = start.inverse().apply({
                    x: startPointerX,
                    y: startPointerY
                });
                matrix.apply(p, p);
                startPointerX = p.x;
                startPointerY = p.y;
            }
            if (matrix.equals(_identityMatrix)) {
                matrix = null;
            }
        }, recordStartPositions = ()=>{
            let edgeTolerance = 1 - self.edgeResistance, offsetX = isFixed ? _getDocScrollLeft(ownerDoc) : 0, offsetY = isFixed ? _getDocScrollTop(ownerDoc) : 0, parsedOrigin, x, y;
            if (xyMode) {
                gsCache.x = getPropAsNum(xProp, "px") + "px";
                gsCache.y = getPropAsNum(yProp, "px") + "px";
                gsCache.renderTransform();
            }
            updateMatrix(false);
            _point1.x = self.pointerX - offsetX;
            _point1.y = self.pointerY - offsetY;
            matrix && matrix.apply(_point1, _point1);
            startPointerX = _point1.x; //translate to local coordinate system
            startPointerY = _point1.y;
            if (dirty) {
                setPointerPosition(self.pointerX, self.pointerY);
                render(true);
            }
            innerMatrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(target);
            if (scrollProxy) {
                calculateBounds();
                startElementY = scrollProxy.top();
                startElementX = scrollProxy.left();
            } else {
                //if the element is in the process of tweening, don't force snapping to occur because it could make it jump. Imagine the user throwing, then before it's done, clicking on the element in its inbetween state.
                if (isTweening()) {
                    syncXY(true, true);
                    calculateBounds();
                } else {
                    self.applyBounds();
                }
                if (rotationMode) {
                    parsedOrigin = target.ownerSVGElement ? [
                        gsCache.xOrigin - target.getBBox().x,
                        gsCache.yOrigin - target.getBBox().y
                    ] : (_getComputedStyle(target)[_transformOriginProp] || "0 0").split(" ");
                    rotationOrigin = self.rotationOrigin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(target).apply({
                        x: parseFloat(parsedOrigin[0]) || 0,
                        y: parseFloat(parsedOrigin[1]) || 0
                    });
                    syncXY(true, true);
                    x = self.pointerX - rotationOrigin.x - offsetX;
                    y = rotationOrigin.y - self.pointerY + offsetY;
                    startElementX = self.x; //starting rotation (x always refers to rotation in type:"rotation", measured in degrees)
                    startElementY = self.y = Math.atan2(y, x) * _RAD2DEG;
                } else {
                    //parent = !isFixed && target.parentNode;
                    //startScrollTop = parent ? parent.scrollTop || 0 : 0;
                    //startScrollLeft = parent ? parent.scrollLeft || 0 : 0;
                    startElementY = getPropAsNum(yProp, "px"); //record the starting top and left values so that we can just add the mouse's movement to them later.
                    startElementX = getPropAsNum(xProp, "px");
                }
            }
            if (hasBounds && edgeTolerance) {
                if (startElementX > maxX) {
                    startElementX = maxX + (startElementX - maxX) / edgeTolerance;
                } else if (startElementX < minX) {
                    startElementX = minX - (minX - startElementX) / edgeTolerance;
                }
                if (!rotationMode) {
                    if (startElementY > maxY) {
                        startElementY = maxY + (startElementY - maxY) / edgeTolerance;
                    } else if (startElementY < minY) {
                        startElementY = minY - (minY - startElementY) / edgeTolerance;
                    }
                }
            }
            self.startX = startElementX = _round(startElementX);
            self.startY = startElementY = _round(startElementY);
        }, isTweening = ()=>self.tween && self.tween.isActive(), removePlaceholder = ()=>{
            if (_placeholderDiv.parentNode && !isTweening() && !self.isDragging) {
                _placeholderDiv.parentNode.removeChild(_placeholderDiv);
            }
        }, //called when the mouse is pressed (or touch starts)
        onPress = (e, force)=>{
            let i;
            if (!enabled || self.isPressed || !e || (e.type === "mousedown" || e.type === "pointerdown") && !force && _getTime() - clickTime < 30 && _touchEventLookup[self.pointerEvent.type]) {
                isPreventingDefault && e && enabled && _preventDefault(e); // in some browsers, we must listen for multiple event types like touchstart, pointerdown, mousedown. The first time this function is called, we record whether or not we _preventDefault() so that on duplicate calls, we can do the same if necessary.
                return;
            }
            interrupted = isTweening();
            dragged = false; // we need to track whether or not it was dragged in this interaction so that if, for example, the user calls .endDrag() to FORCE it to stop and then they keep the mouse pressed down and eventually release, that would normally cause an onClick but we have to skip it in that case if there was dragging that occurred.
            self.pointerEvent = e;
            if (_touchEventLookup[e.type]) {
                touchEventTarget = ~e.type.indexOf("touch") ? e.currentTarget || e.target : ownerDoc; //pointer-based touches (for Microsoft browsers) don't remain locked to the original target like other browsers, so we must use the document instead. The event type would be "MSPointerDown" or "pointerdown".
                _addListener(touchEventTarget, "touchend", onRelease);
                _addListener(touchEventTarget, "touchmove", onMove); // possible future change if PointerEvents are more standardized: https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
                _addListener(touchEventTarget, "touchcancel", onRelease);
                _addListener(ownerDoc, "touchstart", _onMultiTouchDocument);
            } else {
                touchEventTarget = null;
                _addListener(ownerDoc, "mousemove", onMove); //attach these to the document instead of the box itself so that if the user's mouse moves too quickly (and off of the box), things still work.
            }
            touchDragAxis = null;
            if (!_supportsPointer || !touchEventTarget) {
                _addListener(ownerDoc, "mouseup", onRelease);
                e && e.target && _addListener(e.target, "mouseup", onRelease); //we also have to listen directly on the element because some browsers don't bubble up the event to the _doc on elements with contentEditable="true"
            }
            isClicking = isClickable.call(self, e.target) && vars.dragClickables === false && !force;
            if (isClicking) {
                _addListener(e.target, "change", onRelease); //in some browsers, when you mousedown on a <select> element, no mouseup gets dispatched! So we listen for a "change" event instead.
                _dispatchEvent(self, "pressInit", "onPressInit");
                _dispatchEvent(self, "press", "onPress");
                _setSelectable(triggers, true); //accommodates things like inputs and elements with contentEditable="true" (otherwise user couldn't drag to select text)
                isPreventingDefault = false;
                return;
            }
            allowNativeTouchScrolling = !touchEventTarget || allowX === allowY || self.vars.allowNativeTouchScrolling === false || self.vars.allowContextMenu && e && (e.ctrlKey || e.which > 2) ? false : allowX ? "y" : "x"; //note: in Chrome, right-clicking (for a context menu) fires onPress and it doesn't have the event.which set properly, so we must look for event.ctrlKey. If the user wants to allow context menus we should of course sense it here and not allow native touch scrolling.
            isPreventingDefault = !allowNativeTouchScrolling && !self.allowEventDefault;
            if (isPreventingDefault) {
                _preventDefault(e);
                _addListener(_win, "touchforcechange", _preventDefault); //works around safari bug: https://gsap.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/
            }
            if (e.changedTouches) {
                e = touch = e.changedTouches[0];
                touchID = e.identifier;
            } else if (e.pointerId) {
                touchID = e.pointerId; //for some Microsoft browsers
            } else {
                touch = touchID = null;
            }
            _dragCount++;
            _addToRenderQueue(render); //causes the Draggable to render on each "tick" of gsap.ticker (performance optimization - updating values in a mousemove can cause them to happen too frequently, like multiple times between frame redraws which is wasteful, and it also prevents values from updating properly in IE8)
            startPointerY = self.pointerY = e.pageY; //record the starting x and y so that we can calculate the movement from the original in _onMouseMove
            startPointerX = self.pointerX = e.pageX;
            _dispatchEvent(self, "pressInit", "onPressInit");
            if (allowNativeTouchScrolling || self.autoScroll) {
                _recordMaxScrolls(target.parentNode);
            }
            if (target.parentNode && self.autoScroll && !scrollProxy && !rotationMode && target.parentNode._gsMaxScrollX && !_placeholderDiv.parentNode && !target.getBBox) {
                _placeholderDiv.style.width = target.parentNode.scrollWidth + "px";
                target.parentNode.appendChild(_placeholderDiv);
            }
            recordStartPositions();
            self.tween && self.tween.kill();
            self.isThrowing = false;
            gsap.killTweensOf(scrollProxy || target, killProps, true); //in case the user tries to drag it before the last tween is done.
            scrollProxy && gsap.killTweensOf(target, {
                scrollTo: 1
            }, true); //just in case the original target's scroll position is being tweened somewhere else.
            self.tween = self.lockedAxis = null;
            if (vars.zIndexBoost || !rotationMode && !scrollProxy && vars.zIndexBoost !== false) {
                target.style.zIndex = Draggable.zIndex++;
            }
            self.isPressed = true;
            hasDragCallback = !!(vars.onDrag || self._listeners.drag);
            hasMoveCallback = !!(vars.onMove || self._listeners.move);
            if (vars.cursor !== false || vars.activeCursor) {
                i = triggers.length;
                while(--i > -1){
                    gsap.set(triggers[i], {
                        cursor: vars.activeCursor || vars.cursor || (_defaultCursor === "grab" ? "grabbing" : _defaultCursor)
                    });
                }
            }
            _dispatchEvent(self, "press", "onPress");
            // reset the velocity tracking because it's relatively common to suddenly change position in an onPress() or onPressInit()
            InertiaPlugin && InertiaPlugin.track(scrollProxy || target, xyMode ? "x,y" : rotationMode ? "rotation" : "top,left");
        }, //called every time the mouse/touch moves
        onMove = (e)=>{
            let originalEvent = e, touches, pointerX, pointerY, i, dx, dy;
            if (!enabled || _isMultiTouching || !self.isPressed || !e) {
                isPreventingDefault && e && enabled && _preventDefault(e); // in some browsers, we must listen for multiple event types like touchmove, pointermove, mousemove. The first time this function is called, we record whether or not we _preventDefault() so that on duplicate calls, we can do the same if necessary.
                return;
            }
            self.pointerEvent = e;
            touches = e.changedTouches;
            if (touches) {
                e = touches[0];
                if (e !== touch && e.identifier !== touchID) {
                    i = touches.length;
                    while(--i > -1 && (e = touches[i]).identifier !== touchID && e.target !== target){} // Some Android devices dispatch a touchstart AND pointerdown initially, and then only pointermove thus the touchID may not match because it was grabbed from the touchstart event whereas the pointer event is the one that the browser dispatches for move, so if the event target matches this Draggable's target, let it through.
                    if (i < 0) {
                        return;
                    }
                }
            } else if (e.pointerId && touchID && e.pointerId !== touchID) {
                return;
            }
            if (touchEventTarget && allowNativeTouchScrolling && !touchDragAxis) {
                _point1.x = e.pageX - (isFixed ? _getDocScrollLeft(ownerDoc) : 0);
                _point1.y = e.pageY - (isFixed ? _getDocScrollTop(ownerDoc) : 0);
                matrix && matrix.apply(_point1, _point1);
                pointerX = _point1.x;
                pointerY = _point1.y;
                dx = Math.abs(pointerX - startPointerX);
                dy = Math.abs(pointerY - startPointerY);
                if (dx !== dy && (dx > minimumMovement || dy > minimumMovement) || _isAndroid && allowNativeTouchScrolling === touchDragAxis) {
                    touchDragAxis = dx > dy && allowX ? "x" : "y";
                    if (allowNativeTouchScrolling && touchDragAxis !== allowNativeTouchScrolling) {
                        _addListener(_win, "touchforcechange", _preventDefault); // prevents native touch scrolling from taking over if the user started dragging in the other direction in iOS Safari
                    }
                    if (self.vars.lockAxisOnTouchScroll !== false && allowX && allowY) {
                        self.lockedAxis = touchDragAxis === "x" ? "y" : "x";
                        _isFunction(self.vars.onLockAxis) && self.vars.onLockAxis.call(self, originalEvent);
                    }
                    if (_isAndroid && allowNativeTouchScrolling === touchDragAxis) {
                        onRelease(originalEvent);
                        return;
                    }
                }
            }
            if (!self.allowEventDefault && (!allowNativeTouchScrolling || touchDragAxis && allowNativeTouchScrolling !== touchDragAxis) && originalEvent.cancelable !== false) {
                _preventDefault(originalEvent);
                isPreventingDefault = true;
            } else if (isPreventingDefault) {
                isPreventingDefault = false;
            }
            if (self.autoScroll) {
                checkAutoScrollBounds = true;
            }
            setPointerPosition(e.pageX, e.pageY, hasMoveCallback);
        }, setPointerPosition = (pointerX, pointerY, invokeOnMove)=>{
            let dragTolerance = 1 - self.dragResistance, edgeTolerance = 1 - self.edgeResistance, prevPointerX = self.pointerX, prevPointerY = self.pointerY, prevStartElementY = startElementY, prevX = self.x, prevY = self.y, prevEndX = self.endX, prevEndY = self.endY, prevEndRotation = self.endRotation, prevDirty = dirty, xChange, yChange, x, y, dif, temp;
            self.pointerX = pointerX;
            self.pointerY = pointerY;
            if (isFixed) {
                pointerX -= _getDocScrollLeft(ownerDoc);
                pointerY -= _getDocScrollTop(ownerDoc);
            }
            if (rotationMode) {
                y = _round(Math.atan2(rotationOrigin.y - pointerY, pointerX - rotationOrigin.x) * _RAD2DEG);
                dif = self.y - y;
                if (dif > 180) {
                    startElementY -= 360;
                    self.y = y;
                } else if (dif < -180) {
                    startElementY += 360;
                    self.y = y;
                }
                if (matrix) {
                    temp = pointerX * matrix.a + pointerY * matrix.c + matrix.e;
                    pointerY = pointerX * matrix.b + pointerY * matrix.d + matrix.f;
                    pointerX = temp;
                }
                if (self.x !== startElementX || Math.max(Math.abs(startPointerX - pointerX), Math.abs(startPointerY - pointerY)) > minimumMovement) {
                    self.y = y;
                    x = _round(startElementX + (startElementY - y) * dragTolerance);
                } else {
                    x = startElementX;
                }
            } else {
                if (matrix) {
                    temp = pointerX * matrix.a + pointerY * matrix.c + matrix.e;
                    pointerY = pointerX * matrix.b + pointerY * matrix.d + matrix.f;
                    pointerX = temp;
                }
                yChange = pointerY - startPointerY;
                xChange = pointerX - startPointerX;
                if (yChange < minimumMovement && yChange > -minimumMovement) {
                    yChange = 0;
                }
                if (xChange < minimumMovement && xChange > -minimumMovement) {
                    xChange = 0;
                }
                if ((self.lockAxis || self.lockedAxis) && (xChange || yChange)) {
                    temp = self.lockedAxis;
                    if (!temp) {
                        self.lockedAxis = temp = allowX && Math.abs(xChange) > Math.abs(yChange) ? "y" : allowY ? "x" : null;
                        if (temp && _isFunction(self.vars.onLockAxis)) {
                            self.vars.onLockAxis.call(self, self.pointerEvent);
                        }
                    }
                    if (temp === "y") {
                        yChange = 0;
                    } else if (temp === "x") {
                        xChange = 0;
                    }
                }
                x = _round(startElementX + xChange * dragTolerance);
                y = _round(startElementY + yChange * dragTolerance);
            }
            if ((snapX || snapY || snapXY) && (self.x !== x || self.y !== y && !rotationMode)) {
                if (snapXY) {
                    _temp1.x = x;
                    _temp1.y = y;
                    temp = snapXY(_temp1);
                    x = _round(temp.x);
                    y = _round(temp.y);
                }
                if (snapX) {
                    x = _round(snapX(x));
                }
                if (snapY) {
                    y = _round(snapY(y));
                }
            }
            if (hasBounds) {
                if (x > maxX) {
                    x = maxX + Math.round((x - maxX) * edgeTolerance);
                } else if (x < minX) {
                    x = minX + Math.round((x - minX) * edgeTolerance);
                }
                if (!rotationMode) {
                    if (y > maxY) {
                        y = Math.round(maxY + (y - maxY) * edgeTolerance);
                    } else if (y < minY) {
                        y = Math.round(minY + (y - minY) * edgeTolerance);
                    }
                }
            }
            if (self.x !== x || self.y !== y && !rotationMode) {
                if (rotationMode) {
                    self.endRotation = self.x = self.endX = _round(x);
                    dirty = true;
                } else {
                    if (allowY) {
                        self.y = self.endY = y;
                        dirty = true; //a flag that indicates we need to render the target next time the TweenLite.ticker dispatches a "tick" event (typically on a requestAnimationFrame) - this is a performance optimization (we shouldn't render on every move because sometimes many move events can get dispatched between screen refreshes, and that'd be wasteful to render every time)
                    }
                    if (allowX) {
                        self.x = self.endX = x;
                        dirty = true;
                    }
                }
                if (!invokeOnMove || _dispatchEvent(self, "move", "onMove") !== false) {
                    if (!self.isDragging && self.isPressed) {
                        self.isDragging = dragged = true;
                        _dispatchEvent(self, "dragstart", "onDragStart");
                    }
                } else {
                    self.pointerX = prevPointerX;
                    self.pointerY = prevPointerY;
                    startElementY = prevStartElementY;
                    self.x = prevX;
                    self.y = prevY;
                    self.endX = prevEndX;
                    self.endY = prevEndY;
                    self.endRotation = prevEndRotation;
                    dirty = prevDirty;
                }
            }
        }, //called when the mouse/touch is released
        onRelease = (e, force)=>{
            if (!enabled || !self.isPressed || e && touchID != null && !force && (e.pointerId && e.pointerId !== touchID && e.target !== target || e.changedTouches && !_hasTouchID(e.changedTouches, touchID))) {
                isPreventingDefault && e && enabled && _preventDefault(e); // in some browsers, we must listen for multiple event types like touchend, pointerup, mouseup. The first time this function is called, we record whether or not we _preventDefault() so that on duplicate calls, we can do the same if necessary.
                return;
            }
            self.isPressed = false;
            let originalEvent = e, wasDragging = self.isDragging, isContextMenuRelease = self.vars.allowContextMenu && e && (e.ctrlKey || e.which > 2), placeholderDelayedCall = gsap.delayedCall(0.001, removePlaceholder), touches, i, syntheticEvent, eventTarget, syntheticClick;
            if (touchEventTarget) {
                _removeListener(touchEventTarget, "touchend", onRelease);
                _removeListener(touchEventTarget, "touchmove", onMove);
                _removeListener(touchEventTarget, "touchcancel", onRelease);
                _removeListener(ownerDoc, "touchstart", _onMultiTouchDocument);
            } else {
                _removeListener(ownerDoc, "mousemove", onMove);
            }
            _removeListener(_win, "touchforcechange", _preventDefault);
            if (!_supportsPointer || !touchEventTarget) {
                _removeListener(ownerDoc, "mouseup", onRelease);
                e && e.target && _removeListener(e.target, "mouseup", onRelease);
            }
            dirty = false;
            if (wasDragging) {
                dragEndTime = _lastDragTime = _getTime();
                self.isDragging = false;
            }
            _removeFromRenderQueue(render);
            if (isClicking && !isContextMenuRelease) {
                if (e) {
                    _removeListener(e.target, "change", onRelease);
                    self.pointerEvent = originalEvent;
                }
                _setSelectable(triggers, false);
                _dispatchEvent(self, "release", "onRelease");
                _dispatchEvent(self, "click", "onClick");
                isClicking = false;
                return;
            }
            i = triggers.length;
            while(--i > -1){
                _setStyle(triggers[i], "cursor", vars.cursor || (vars.cursor !== false ? _defaultCursor : null));
            }
            _dragCount--;
            if (e) {
                touches = e.changedTouches;
                if (touches) {
                    e = touches[0];
                    if (e !== touch && e.identifier !== touchID) {
                        i = touches.length;
                        while(--i > -1 && (e = touches[i]).identifier !== touchID && e.target !== target){}
                        if (i < 0 && !force) {
                            return;
                        }
                    }
                }
                self.pointerEvent = originalEvent;
                self.pointerX = e.pageX;
                self.pointerY = e.pageY;
            }
            if (isContextMenuRelease && originalEvent) {
                _preventDefault(originalEvent);
                isPreventingDefault = true;
                _dispatchEvent(self, "release", "onRelease");
            } else if (originalEvent && !wasDragging) {
                isPreventingDefault = false;
                if (interrupted && (vars.snap || vars.bounds)) {
                    animate(vars.inertia || vars.throwProps);
                }
                _dispatchEvent(self, "release", "onRelease");
                if ((!_isAndroid || originalEvent.type !== "touchmove") && originalEvent.type.indexOf("cancel") === -1) {
                    _dispatchEvent(self, "click", "onClick");
                    if (_getTime() - clickTime < 300) {
                        _dispatchEvent(self, "doubleclick", "onDoubleClick");
                    }
                    eventTarget = originalEvent.target || target; //old IE uses srcElement
                    clickTime = _getTime();
                    syntheticClick = ()=>{
                        if (clickTime !== clickDispatch && self.enabled() && !self.isPressed && !originalEvent.defaultPrevented) {
                            if (eventTarget.click) {
                                eventTarget.click();
                            } else if (ownerDoc.createEvent) {
                                syntheticEvent = ownerDoc.createEvent("MouseEvents");
                                syntheticEvent.initMouseEvent("click", true, true, _win, 1, self.pointerEvent.screenX, self.pointerEvent.screenY, self.pointerX, self.pointerY, false, false, false, false, 0, null);
                                eventTarget.dispatchEvent(syntheticEvent);
                            }
                        }
                    };
                    if (!_isAndroid && !originalEvent.defaultPrevented) {
                        gsap.delayedCall(0.05, syntheticClick); //in addition to the iOS bug workaround, there's a Firefox issue with clicking on things like a video to play, so we must fake a click event in a slightly delayed fashion. Previously, we listened for the "click" event with "capture" false which solved the video-click-to-play issue, but it would allow the "click" event to be dispatched twice like if you were using a jQuery.click() because that was handled in the capture phase, thus we had to switch to the capture phase to avoid the double-dispatching, but do the delayed synthetic click. Don't fire it too fast (like 0.00001) because we want to give the native event a chance to fire first as it's "trusted".
                    }
                }
            } else {
                animate(vars.inertia || vars.throwProps); //will skip if inertia/throwProps isn't defined or InertiaPlugin isn't loaded.
                if (!self.allowEventDefault && originalEvent && (vars.dragClickables !== false || !isClickable.call(self, originalEvent.target)) && wasDragging && (!allowNativeTouchScrolling || touchDragAxis && allowNativeTouchScrolling === touchDragAxis) && originalEvent.cancelable !== false) {
                    isPreventingDefault = true;
                    _preventDefault(originalEvent);
                } else {
                    isPreventingDefault = false;
                }
                _dispatchEvent(self, "release", "onRelease");
            }
            isTweening() && placeholderDelayedCall.duration(self.tween.duration()); //sync the timing so that the placeholder DIV gets
            wasDragging && _dispatchEvent(self, "dragend", "onDragEnd");
            return true;
        }, updateScroll = (e)=>{
            if (e && self.isDragging && !scrollProxy) {
                let parent = e.target || target.parentNode, deltaX = parent.scrollLeft - parent._gsScrollX, deltaY = parent.scrollTop - parent._gsScrollY;
                if (deltaX || deltaY) {
                    if (matrix) {
                        startPointerX -= deltaX * matrix.a + deltaY * matrix.c;
                        startPointerY -= deltaY * matrix.d + deltaX * matrix.b;
                    } else {
                        startPointerX -= deltaX;
                        startPointerY -= deltaY;
                    }
                    parent._gsScrollX += deltaX;
                    parent._gsScrollY += deltaY;
                    setPointerPosition(self.pointerX, self.pointerY);
                }
            }
        }, onClick = (e)=>{
            let time = _getTime(), recentlyClicked = time - clickTime < 100, recentlyDragged = time - dragEndTime < 50, alreadyDispatched = recentlyClicked && clickDispatch === clickTime, defaultPrevented = self.pointerEvent && self.pointerEvent.defaultPrevented, alreadyDispatchedTrusted = recentlyClicked && trustedClickDispatch === clickTime, trusted = e.isTrusted || e.isTrusted == null && recentlyClicked && alreadyDispatched; //note: Safari doesn't support isTrusted, and it won't properly execute native behavior (like toggling checkboxes) on the first synthetic "click" event - we must wait for the 2nd and treat it as trusted (but stop propagation at that point). Confusing, I know. Don't you love cross-browser compatibility challenges?
            if ((alreadyDispatched || recentlyDragged && self.vars.suppressClickOnDrag !== false) && e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }
            if (recentlyClicked && !(self.pointerEvent && self.pointerEvent.defaultPrevented) && (!alreadyDispatched || trusted && !alreadyDispatchedTrusted)) {
                if (trusted && alreadyDispatched) {
                    trustedClickDispatch = clickTime;
                }
                clickDispatch = clickTime;
                return;
            }
            if (self.isPressed || recentlyDragged || recentlyClicked) {
                if (!trusted || !e.detail || !recentlyClicked || defaultPrevented) {
                    _preventDefault(e);
                }
            }
            if (!recentlyClicked && !recentlyDragged && !dragged) {
                e && e.target && (self.pointerEvent = e);
                _dispatchEvent(self, "click", "onClick");
            }
        }, localizePoint = (p)=>matrix ? {
                x: p.x * matrix.a + p.y * matrix.c + matrix.e,
                y: p.x * matrix.b + p.y * matrix.d + matrix.f
            } : {
                x: p.x,
                y: p.y
            };
        old = Draggable.get(target);
        old && old.kill(); // avoids duplicates (an element can only be controlled by one Draggable)
        //give the user access to start/stop dragging...
        this.startDrag = (event, align)=>{
            let r1, r2, p1, p2;
            onPress(event || self.pointerEvent, true);
            //if the pointer isn't on top of the element, adjust things accordingly
            if (align && !self.hitTest(event || self.pointerEvent)) {
                r1 = _parseRect(event || self.pointerEvent);
                r2 = _parseRect(target);
                p1 = localizePoint({
                    x: r1.left + r1.width / 2,
                    y: r1.top + r1.height / 2
                });
                p2 = localizePoint({
                    x: r2.left + r2.width / 2,
                    y: r2.top + r2.height / 2
                });
                startPointerX -= p1.x - p2.x;
                startPointerY -= p1.y - p2.y;
            }
            if (!self.isDragging) {
                self.isDragging = dragged = true;
                _dispatchEvent(self, "dragstart", "onDragStart");
            }
        };
        this.drag = onMove;
        this.endDrag = (e)=>onRelease(e || self.pointerEvent, true);
        this.timeSinceDrag = ()=>self.isDragging ? 0 : (_getTime() - dragEndTime) / 1000;
        this.timeSinceClick = ()=>(_getTime() - clickTime) / 1000;
        this.hitTest = (target, threshold)=>Draggable.hitTest(self.target, target, threshold);
        this.getDirection = (from, diagonalThreshold)=>{
            let mode = from === "velocity" && InertiaPlugin ? from : _isObject(from) && !rotationMode ? "element" : "start", xChange, yChange, ratio, direction, r1, r2;
            if (mode === "element") {
                r1 = _parseRect(self.target);
                r2 = _parseRect(from);
            }
            xChange = mode === "start" ? self.x - startElementX : mode === "velocity" ? InertiaPlugin.getVelocity(target, xProp) : r1.left + r1.width / 2 - (r2.left + r2.width / 2);
            if (rotationMode) {
                return xChange < 0 ? "counter-clockwise" : "clockwise";
            } else {
                diagonalThreshold = diagonalThreshold || 2;
                yChange = mode === "start" ? self.y - startElementY : mode === "velocity" ? InertiaPlugin.getVelocity(target, yProp) : r1.top + r1.height / 2 - (r2.top + r2.height / 2);
                ratio = Math.abs(xChange / yChange);
                direction = ratio < 1 / diagonalThreshold ? "" : xChange < 0 ? "left" : "right";
                if (ratio < diagonalThreshold) {
                    if (direction !== "") {
                        direction += "-";
                    }
                    direction += yChange < 0 ? "up" : "down";
                }
            }
            return direction;
        };
        this.applyBounds = (newBounds, sticky)=>{
            let x, y, forceZeroVelocity, e, parent, isRoot;
            if (newBounds && vars.bounds !== newBounds) {
                vars.bounds = newBounds;
                return self.update(true, sticky);
            }
            syncXY(true);
            calculateBounds();
            if (hasBounds && !isTweening()) {
                x = self.x;
                y = self.y;
                if (x > maxX) {
                    x = maxX;
                } else if (x < minX) {
                    x = minX;
                }
                if (y > maxY) {
                    y = maxY;
                } else if (y < minY) {
                    y = minY;
                }
                if (self.x !== x || self.y !== y) {
                    forceZeroVelocity = true;
                    self.x = self.endX = x;
                    if (rotationMode) {
                        self.endRotation = x;
                    } else {
                        self.y = self.endY = y;
                    }
                    dirty = true;
                    render(true);
                    if (self.autoScroll && !self.isDragging) {
                        _recordMaxScrolls(target.parentNode);
                        e = target;
                        _windowProxy.scrollTop = _win.pageYOffset != null ? _win.pageYOffset : ownerDoc.documentElement.scrollTop != null ? ownerDoc.documentElement.scrollTop : ownerDoc.body.scrollTop;
                        _windowProxy.scrollLeft = _win.pageXOffset != null ? _win.pageXOffset : ownerDoc.documentElement.scrollLeft != null ? ownerDoc.documentElement.scrollLeft : ownerDoc.body.scrollLeft;
                        while(e && !isRoot){
                            isRoot = _isRoot(e.parentNode);
                            parent = isRoot ? _windowProxy : e.parentNode;
                            if (allowY && parent.scrollTop > parent._gsMaxScrollY) {
                                parent.scrollTop = parent._gsMaxScrollY;
                            }
                            if (allowX && parent.scrollLeft > parent._gsMaxScrollX) {
                                parent.scrollLeft = parent._gsMaxScrollX;
                            }
                            e = parent;
                        }
                    }
                }
                if (self.isThrowing && (forceZeroVelocity || self.endX > maxX || self.endX < minX || self.endY > maxY || self.endY < minY)) {
                    animate(vars.inertia || vars.throwProps, forceZeroVelocity);
                }
            }
            return self;
        };
        this.update = (applyBounds, sticky, ignoreExternalChanges)=>{
            if (sticky && self.isPressed) {
                if (rotationMode) {
                    self.x = self.y = _round(parseFloat(gsCache.rotation));
                } else {
                    let m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(target), p = innerMatrix.apply({
                        x: self.x - startElementX,
                        y: self.y - startElementY
                    }), m2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(target.parentNode, true);
                    m2.apply({
                        x: m.e - p.x,
                        y: m.f - p.y
                    }, p);
                    self.x = _round(self.x - (p.x - m2.e));
                    self.y = _round(self.y - (p.y - m2.f));
                }
                render(true);
                recordStartPositions();
            }
            let { x, y } = self;
            updateMatrix(!sticky);
            if (applyBounds) {
                self.applyBounds();
            } else {
                dirty && ignoreExternalChanges && render(true);
                syncXY(true);
            }
            if (sticky) {
                setPointerPosition(self.pointerX, self.pointerY);
                dirty && render(true);
            }
            if (self.isPressed && !sticky && (allowX && Math.abs(x - self.x) > 0.01 || allowY && Math.abs(y - self.y) > 0.01 && !rotationMode)) {
                recordStartPositions();
            }
            if (self.autoScroll) {
                _recordMaxScrolls(target.parentNode, self.isDragging);
                checkAutoScrollBounds = self.isDragging;
                render(true);
                //in case reparenting occurred.
                _removeScrollListener(target, updateScroll);
                _addScrollListener(target, updateScroll);
            }
            return self;
        };
        this.enable = (type)=>{
            let setVars = {
                lazy: true
            }, id, i, trigger;
            if (vars.cursor !== false) {
                setVars.cursor = vars.cursor || _defaultCursor;
            }
            if (gsap.utils.checkPrefix("touchCallout")) {
                setVars.touchCallout = "none";
            }
            if (type !== "soft") {
                _setTouchActionForAllDescendants(triggers, allowX === allowY ? "none" : vars.allowNativeTouchScrolling && target.scrollHeight === target.clientHeight === (target.scrollWidth === target.clientHeight) || vars.allowEventDefault ? "manipulation" : allowX ? "pan-y" : "pan-x"); // Some browsers like Internet Explorer will fire a pointercancel event when the user attempts to drag when touchAction is "manipulate" because it's perceived as a pan. If the element has scrollable content in only one direction, we should use pan-x or pan-y accordingly so that the pointercancel doesn't prevent dragging.
                i = triggers.length;
                while(--i > -1){
                    trigger = triggers[i];
                    _supportsPointer || _addListener(trigger, "mousedown", onPress);
                    _addListener(trigger, "touchstart", onPress);
                    _addListener(trigger, "click", onClick, true); // note: used to pass true for capture but it prevented click-to-play-video functionality in Firefox.
                    gsap.set(trigger, setVars);
                    if (trigger.getBBox && trigger.ownerSVGElement && allowX !== allowY) {
                        gsap.set(trigger.ownerSVGElement, {
                            touchAction: vars.allowNativeTouchScrolling || vars.allowEventDefault ? "manipulation" : allowX ? "pan-y" : "pan-x"
                        });
                    }
                    vars.allowContextMenu || _addListener(trigger, "contextmenu", onContextMenu);
                }
                _setSelectable(triggers, false);
            }
            _addScrollListener(target, updateScroll);
            enabled = true;
            if (InertiaPlugin && type !== "soft") {
                InertiaPlugin.track(scrollProxy || target, xyMode ? "x,y" : rotationMode ? "rotation" : "top,left");
            }
            target._gsDragID = id = target._gsDragID || "d" + _lookupCount++;
            _lookup[id] = self;
            if (scrollProxy) {
                scrollProxy.enable();
                scrollProxy.element._gsDragID = id;
            }
            (vars.bounds || rotationMode) && recordStartPositions();
            vars.bounds && self.applyBounds();
            return self;
        };
        this.disable = (type)=>{
            let dragging = self.isDragging, i = triggers.length, trigger;
            while(--i > -1){
                _setStyle(triggers[i], "cursor", null);
            }
            if (type !== "soft") {
                _setTouchActionForAllDescendants(triggers, null);
                i = triggers.length;
                while(--i > -1){
                    trigger = triggers[i];
                    _setStyle(trigger, "touchCallout", null);
                    _removeListener(trigger, "mousedown", onPress);
                    _removeListener(trigger, "touchstart", onPress);
                    _removeListener(trigger, "click", onClick, true);
                    _removeListener(trigger, "contextmenu", onContextMenu);
                }
                _setSelectable(triggers, true);
                if (touchEventTarget) {
                    _removeListener(touchEventTarget, "touchcancel", onRelease);
                    _removeListener(touchEventTarget, "touchend", onRelease);
                    _removeListener(touchEventTarget, "touchmove", onMove);
                }
                _removeListener(ownerDoc, "mouseup", onRelease);
                _removeListener(ownerDoc, "mousemove", onMove);
            }
            _removeScrollListener(target, updateScroll);
            enabled = false;
            if (InertiaPlugin && type !== "soft") {
                InertiaPlugin.untrack(scrollProxy || target, xyMode ? "x,y" : rotationMode ? "rotation" : "top,left");
                self.tween && self.tween.kill();
            }
            scrollProxy && scrollProxy.disable();
            _removeFromRenderQueue(render);
            self.isDragging = self.isPressed = isClicking = false;
            dragging && _dispatchEvent(self, "dragend", "onDragEnd");
            return self;
        };
        this.enabled = function(value, type) {
            return arguments.length ? value ? self.enable(type) : self.disable(type) : enabled;
        };
        this.kill = function() {
            self.isThrowing = false;
            self.tween && self.tween.kill();
            self.disable();
            gsap.set(triggers, {
                clearProps: "userSelect"
            });
            delete _lookup[target._gsDragID];
            return self;
        };
        this.revert = function() {
            this.kill();
            this.styles && this.styles.revert();
        };
        if (~type.indexOf("scroll")) {
            scrollProxy = this.scrollProxy = new ScrollProxy(target, _extend({
                onKill: function() {
                    self.isPressed && onRelease(null);
                }
            }, vars));
            //a bug in many Android devices' stock browser causes scrollTop to get forced back to 0 after it is altered via JS, so we set overflow to "hidden" on mobile/touch devices (they hide the scroll bar anyway). That works around the bug. (This bug is discussed at https://code.google.com/p/android/issues/detail?id=19625)
            target.style.overflowY = allowY && !_isTouchDevice ? "auto" : "hidden";
            target.style.overflowX = allowX && !_isTouchDevice ? "auto" : "hidden";
            target = scrollProxy.content;
        }
        if (rotationMode) {
            killProps.rotation = 1;
        } else {
            if (allowX) {
                killProps[xProp] = 1;
            }
            if (allowY) {
                killProps[yProp] = 1;
            }
        }
        gsCache.force3D = "force3D" in vars ? vars.force3D : true; //otherwise, normal dragging would be in 2D and then as soon as it's released and there's an inertia tween, it'd jump to 3D which can create an initial jump due to the work the browser must to do layerize it.
        _context(this);
        this.enable();
    }
    static register(core) {
        gsap = core;
        _initCore();
    }
    static create(targets, vars) {
        _coreInitted || _initCore(true);
        return _toArray(targets).map((target)=>new Draggable(target, vars));
    }
    static get(target) {
        return _lookup[(_toArray(target)[0] || {})._gsDragID];
    }
    static timeSinceDrag() {
        return (_getTime() - _lastDragTime) / 1000;
    }
    static hitTest(obj1, obj2, threshold) {
        if (obj1 === obj2) {
            return false;
        }
        let r1 = _parseRect(obj1), r2 = _parseRect(obj2), { top, left, right, bottom, width, height } = r1, isOutside = r2.left > right || r2.right < left || r2.top > bottom || r2.bottom < top, overlap, area, isRatio;
        if (isOutside || !threshold) {
            return !isOutside;
        }
        isRatio = (threshold + "").indexOf("%") !== -1;
        threshold = parseFloat(threshold) || 0;
        overlap = {
            left: Math.max(left, r2.left),
            top: Math.max(top, r2.top)
        };
        overlap.width = Math.min(right, r2.right) - overlap.left;
        overlap.height = Math.min(bottom, r2.bottom) - overlap.top;
        if (overlap.width < 0 || overlap.height < 0) {
            return false;
        }
        if (isRatio) {
            threshold *= 0.01;
            area = overlap.width * overlap.height;
            return area >= width * height * threshold || area >= r2.width * r2.height * threshold;
        }
        return overlap.width > threshold && overlap.height > threshold;
    }
}
_setDefaults(Draggable.prototype, {
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isDragging: false,
    isPressed: false
});
Draggable.zIndex = 1000;
Draggable.version = "3.15.0";
_getGSAP() && gsap.registerPlugin(Draggable);
;
}),
"[project]/apps/web/src/lib/gsap/src/utils/VelocityTracker.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VelocityTracker",
    ()=>VelocityTracker,
    "default",
    ()=>VelocityTracker
]);
/*!
 * VelocityTracker: 3.15.0
 * https://gsap.com
 *
 * Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ // @ts-nocheck
let gsap, _coreInitted, _toArray, _getUnit, _first, _ticker, _time1, _time2, _getCache, _getGSAP = ()=>gsap || ("TURBOPACK compile-time value", "undefined") !== "undefined" && (gsap = window.gsap), _lookup = {}, _round = (value)=>Math.round(value * 10000) / 10000, _getID = (target)=>_getCache(target).id, _getByTarget = (target)=>_lookup[_getID(typeof target === "string" ? _toArray(target)[0] : target)], _onTick = (time)=>{
    let pt = _first, val;
    //if the frame rate is too high, we won't be able to track the velocity as well, so only update the values about 20 times per second
    if (time - _time1 >= 0.05) {
        _time2 = _time1;
        _time1 = time;
        while(pt){
            val = pt.g(pt.t, pt.p);
            if (val !== pt.v1 || time - pt.t1 > 0.2) {
                pt.v2 = pt.v1;
                pt.v1 = val;
                pt.t2 = pt.t1;
                pt.t1 = time;
            }
            pt = pt._next;
        }
    }
}, _types = {
    deg: 360,
    rad: Math.PI * 2
}, _initCore = ()=>{
    gsap = _getGSAP();
    if (gsap) {
        _toArray = gsap.utils.toArray;
        _getUnit = gsap.utils.getUnit;
        _getCache = gsap.core.getCache;
        _ticker = gsap.ticker;
        _coreInitted = 1;
    }
};
class PropTracker {
    constructor(target, property, type, next){
        this.t = target;
        this.p = property;
        this.g = target._gsap.get;
        this.rCap = _types[type || _getUnit(this.g(target, property))]; //rotational cap (for degrees, "deg", it's 360 and for radians, "rad", it's Math.PI * 2)
        this.v1 = this.v2 = this.g(target, property);
        this.t1 = this.t2 = _ticker.time;
        if (next) {
            this._next = next;
            next._prev = this;
        }
    }
}
class VelocityTracker {
    constructor(target, property){
        _coreInitted || _initCore();
        this.target = _toArray(target)[0];
        _lookup[_getID(this.target)] = this;
        this._props = {};
        property && this.add(property);
    }
    static register(core) {
        gsap = core;
        _initCore();
    }
    get(property, skipRecentTick) {
        let pt = this._props[property] || console.warn("Not tracking " + property + " velocity."), val, dif, rotationCap;
        val = parseFloat(skipRecentTick ? pt.v1 : pt.g(pt.t, pt.p));
        dif = val - parseFloat(pt.v2);
        rotationCap = pt.rCap;
        if (rotationCap) {
            dif = dif % rotationCap;
            if (dif !== dif % (rotationCap / 2)) {
                dif = dif < 0 ? dif + rotationCap : dif - rotationCap;
            }
        }
        return _round(dif / ((skipRecentTick ? pt.t1 : _ticker.time) - pt.t2));
    }
    getAll() {
        let result = {}, props = this._props, p;
        for(p in props){
            result[p] = this.get(p);
        }
        return result;
    }
    isTracking(property) {
        return property in this._props;
    }
    add(property, type) {
        let pt = this._props[property];
        if (pt) {
            pt.v1 = pt.v2 = pt.g(pt.t, pt.p);
            pt.t1 = pt.t2 = _ticker.time;
        } else {
            if (!_first) {
                _ticker.add(_onTick);
                _time1 = _time2 = _ticker.time;
            }
            _first = this._props[property] = new PropTracker(this.target, property, type, _first);
        }
    }
    remove(property) {
        let pt = this._props[property], prev, next;
        if (pt) {
            prev = pt._prev;
            next = pt._next;
            if (prev) {
                prev._next = next;
            }
            if (next) {
                next._prev = prev;
            } else if (_first === pt) {
                _ticker.remove(_onTick);
                _first = 0;
            }
            delete this._props[property];
        }
    }
    kill(shallow) {
        for(let p in this._props){
            this.remove(p);
        }
        if (!shallow) {
            delete _lookup[_getID(this.target)];
        }
    }
    static track(targets, properties, types) {
        _coreInitted || _initCore();
        let result = [], targs = _toArray(targets), a = properties.split(","), t = (types || "").split(","), i = targs.length, tracker, j;
        while(i--){
            tracker = _getByTarget(targs[i]) || new VelocityTracker(targs[i]);
            j = a.length;
            while(j--){
                tracker.add(a[j], t[j] || t[0]);
            }
            result.push(tracker);
        }
        return result;
    }
    static untrack(targets, properties) {
        let props = properties && properties.split(",");
        _toArray(targets).forEach((target)=>{
            let tracker = _getByTarget(target);
            if (tracker) {
                props ? props.forEach((p)=>tracker.remove(p)) : tracker.kill(1);
            }
        });
    }
    static isTracking(target, property) {
        let tracker = _getByTarget(target);
        return tracker && tracker.isTracking(property);
    }
    static getVelocity(target, property) {
        let tracker = _getByTarget(target);
        return !tracker || !tracker.isTracking(property) ? console.warn("Not tracking velocity of " + property) : tracker.get(property);
    }
}
VelocityTracker.getByTarget = _getByTarget;
_getGSAP() && gsap.registerPlugin(VelocityTracker);
;
}),
"[project]/apps/web/src/lib/gsap/src/InertiaPlugin.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InertiaPlugin",
    ()=>InertiaPlugin,
    "default",
    ()=>InertiaPlugin
]);
/*!
 * InertiaPlugin 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$VelocityTracker$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/VelocityTracker.js [app-ssr] (ecmascript)");
;
let gsap, _coreInitted, _parseEase, _toArray, _power3, _config, _getUnit, PropTween, _getCache, _checkPointRatio, _clamp, _processingVars, _getStyleSaver, _reverting, _getTracker = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$VelocityTracker$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VelocityTracker"].getByTarget, _getGSAP = ()=>gsap || ("TURBOPACK compile-time value", "undefined") !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap, _isString = (value)=>typeof value === "string", _isNumber = (value)=>typeof value === "number", _isObject = (value)=>typeof value === "object", _isFunction = (value)=>typeof value === "function", _bonusValidated = 1, _isArray = Array.isArray, _emptyFunc = (p)=>p, _bigNum = 1e10, _tinyNum = 1 / _bigNum, _checkPoint = 0.05, _round = (value)=>Math.round(value * 10000) / 10000, _extend = (obj, defaults, exclude)=>{
    for(let p in defaults){
        if (!(p in obj) && p !== exclude) {
            obj[p] = defaults[p];
        }
    }
    return obj;
}, _deepClone = (obj)=>{
    let copy = {}, p, v;
    for(p in obj){
        copy[p] = _isObject(v = obj[p]) && !_isArray(v) ? _deepClone(v) : v;
    }
    return copy;
}, _getClosest = (n, values, max, min, radius)=>{
    let i = values.length, closest = 0, absDif = _bigNum, val, dif, p, dist;
    if (_isObject(n)) {
        while(i--){
            val = values[i];
            dif = 0;
            for(p in n){
                dist = val[p] - n[p];
                dif += dist * dist;
            }
            if (dif < absDif) {
                closest = i;
                absDif = dif;
            }
        }
        if ((radius || _bigNum) < _bigNum && radius < Math.sqrt(absDif)) {
            return n;
        }
    } else {
        while(i--){
            val = values[i];
            dif = val - n;
            if (dif < 0) {
                dif = -dif;
            }
            if (dif < absDif && val >= min && val <= max) {
                closest = i;
                absDif = dif;
            }
        }
    }
    return values[closest];
}, _parseEnd = (curProp, end, max, min, name, radius, velocity)=>{
    if (curProp.end === "auto") {
        return curProp;
    }
    let endVar = curProp.end, adjustedEnd, p;
    max = isNaN(max) ? _bigNum : max;
    min = isNaN(min) ? -_bigNum : min;
    if (_isObject(end)) {
        adjustedEnd = end.calculated ? end : (_isFunction(endVar) ? endVar(end, velocity) : _getClosest(end, endVar, max, min, radius)) || end;
        if (!end.calculated) {
            for(p in adjustedEnd){
                end[p] = adjustedEnd[p];
            }
            end.calculated = true;
        }
        adjustedEnd = adjustedEnd[name];
    } else {
        adjustedEnd = _isFunction(endVar) ? endVar(end, velocity) : _isArray(endVar) ? _getClosest(end, endVar, max, min, radius) : parseFloat(endVar);
    }
    if (adjustedEnd > max) {
        adjustedEnd = max;
    } else if (adjustedEnd < min) {
        adjustedEnd = min;
    }
    return {
        max: adjustedEnd,
        min: adjustedEnd,
        unitFactor: curProp.unitFactor
    };
}, _getNumOrDefault = (vars, property, defaultValue)=>isNaN(vars[property]) ? defaultValue : +vars[property], _calculateChange = (velocity, duration)=>duration * _checkPoint * velocity / _checkPointRatio, _calculateDuration = (start, end, velocity)=>Math.abs((end - start) * _checkPointRatio / velocity / _checkPoint), _reservedProps = {
    resistance: 1,
    checkpoint: 1,
    preventOvershoot: 1,
    linkedProps: 1,
    radius: 1,
    duration: 1
}, _processLinkedProps = (target, vars, getVal, resistance)=>{
    if (vars.linkedProps) {
        let linkedPropNames = vars.linkedProps.split(","), linkedProps = {}, i, p, curProp, curVelocity, tracker, curDuration;
        for(i = 0; i < linkedPropNames.length; i++){
            p = linkedPropNames[i];
            curProp = vars[p];
            if (curProp) {
                if (_isNumber(curProp.velocity)) {
                    curVelocity = curProp.velocity;
                } else {
                    tracker = tracker || _getTracker(target);
                    curVelocity = tracker && tracker.isTracking(p) ? tracker.get(p) : 0;
                }
                curDuration = Math.abs(curVelocity / _getNumOrDefault(curProp, "resistance", resistance));
                linkedProps[p] = parseFloat(getVal(target, p)) + _calculateChange(curVelocity, curDuration);
            }
        }
        return linkedProps;
    }
}, _calculateTweenDuration = (target, vars, maxDuration = 10, minDuration = 0.2, overshootTolerance = 1, recordEnd = 0)=>{
    _isString(target) && (target = _toArray(target)[0]);
    if (!target) {
        return 0;
    }
    let duration = 0, clippedDuration = _bigNum, inertiaVars = vars.inertia || vars, getVal = _getCache(target).get, resistance = _getNumOrDefault(inertiaVars, "resistance", _config.resistance), p, curProp, curDuration, curVelocity, curVal, end, curClippedDuration, tracker, unitFactor, linkedProps;
    //when there are linkedProps (typically "x,y" where snapping has to factor in multiple properties, we must first populate an object with all of those end values, then feed it to the function that make any necessary alterations. So the point of this first loop is to simply build an object (like {x:100, y:204.5}) for feeding into that function which we'll do later in the "real" loop.
    linkedProps = _processLinkedProps(target, inertiaVars, getVal, resistance);
    for(p in inertiaVars){
        if (!_reservedProps[p]) {
            curProp = inertiaVars[p];
            if (!_isObject(curProp)) {
                tracker = tracker || _getTracker(target);
                if (tracker && tracker.isTracking(p)) {
                    curProp = _isNumber(curProp) ? {
                        velocity: curProp
                    } : {
                        velocity: tracker.get(p)
                    }; //if we're tracking this property, we should use the tracking velocity and then use the numeric value that was passed in as the min and max so that it tweens exactly there.
                } else {
                    curVelocity = +curProp || 0;
                    curDuration = Math.abs(curVelocity / resistance);
                }
            }
            if (_isObject(curProp)) {
                if (_isNumber(curProp.velocity)) {
                    curVelocity = curProp.velocity;
                } else {
                    tracker = tracker || _getTracker(target);
                    curVelocity = tracker && tracker.isTracking(p) ? tracker.get(p) : 0;
                }
                curDuration = _clamp(minDuration, maxDuration, Math.abs(curVelocity / _getNumOrDefault(curProp, "resistance", resistance)));
                curVal = parseFloat(getVal(target, p)) || 0;
                end = curVal + _calculateChange(curVelocity, curDuration);
                if ("end" in curProp) {
                    curProp = _parseEnd(curProp, linkedProps && p in linkedProps ? linkedProps : end, curProp.max, curProp.min, p, inertiaVars.radius, curVelocity);
                    if (recordEnd) {
                        _processingVars === vars && (_processingVars = inertiaVars = _deepClone(vars));
                        inertiaVars[p] = _extend(curProp, inertiaVars[p], "end");
                    }
                }
                if ("max" in curProp && end > +curProp.max + _tinyNum) {
                    unitFactor = curProp.unitFactor || _config.unitFactors[p] || 1; //some values are measured in special units like radians in which case our thresholds need to be adjusted accordingly.
                    //if the value is already exceeding the max or the velocity is too low, the duration can end up being uncomfortably long but in most situations, users want the snapping to occur relatively quickly (0.75 seconds), so we implement a cap here to make things more intuitive. If the max and min match, it means we're animating to a particular value and we don't want to shorten the time unless the velocity is really slow. Example: a rotation where the start and natural end value are less than the snapping spot, but the natural end is pretty close to the snap.
                    curClippedDuration = curVal > curProp.max && curProp.min !== curProp.max || curVelocity * unitFactor > -15 && curVelocity * unitFactor < 45 ? minDuration + (maxDuration - minDuration) * 0.1 : _calculateDuration(curVal, curProp.max, curVelocity);
                    if (curClippedDuration + overshootTolerance < clippedDuration) {
                        clippedDuration = curClippedDuration + overshootTolerance;
                    }
                } else if ("min" in curProp && end < +curProp.min - _tinyNum) {
                    unitFactor = curProp.unitFactor || _config.unitFactors[p] || 1; //some values are measured in special units like radians in which case our thresholds need to be adjusted accordingly.
                    //if the value is already exceeding the min or if the velocity is too low, the duration can end up being uncomfortably long but in most situations, users want the snapping to occur relatively quickly (0.75 seconds), so we implement a cap here to make things more intuitive.
                    curClippedDuration = curVal < curProp.min && curProp.min !== curProp.max || curVelocity * unitFactor > -45 && curVelocity * unitFactor < 15 ? minDuration + (maxDuration - minDuration) * 0.1 : _calculateDuration(curVal, curProp.min, curVelocity);
                    if (curClippedDuration + overshootTolerance < clippedDuration) {
                        clippedDuration = curClippedDuration + overshootTolerance;
                    }
                }
                curClippedDuration > duration && (duration = curClippedDuration);
            }
            curDuration > duration && (duration = curDuration);
        }
    }
    duration > clippedDuration && (duration = clippedDuration);
    return duration > maxDuration ? maxDuration : duration < minDuration ? minDuration : duration;
}, _initCore = ()=>{
    gsap = _getGSAP();
    if (gsap) {
        _parseEase = gsap.parseEase;
        _toArray = gsap.utils.toArray;
        _getUnit = gsap.utils.getUnit;
        _getCache = gsap.core.getCache;
        _clamp = gsap.utils.clamp;
        _getStyleSaver = gsap.core.getStyleSaver;
        _reverting = gsap.core.reverting || function() {};
        _power3 = _parseEase("power3");
        _checkPointRatio = _power3(0.05);
        PropTween = gsap.core.PropTween;
        gsap.config({
            resistance: 100,
            unitFactors: {
                time: 1000,
                totalTime: 1000,
                progress: 1000,
                totalProgress: 1000
            }
        });
        _config = gsap.config();
        gsap.registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$VelocityTracker$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VelocityTracker"]);
        _coreInitted = 1;
    }
};
const InertiaPlugin = {
    version: "3.15.0",
    name: "inertia",
    register (core) {
        gsap = core;
        _initCore();
    },
    init (target, vars, tween, index, targets) {
        _coreInitted || _initCore();
        let tracker = _getTracker(target);
        if (vars === "auto") {
            if (!tracker) {
                console.warn("No inertia tracking on " + target + ". InertiaPlugin.track(target) first.");
                return;
            }
            vars = tracker.getAll();
        }
        this.styles = _getStyleSaver && typeof target.style === "object" && _getStyleSaver(target);
        this.target = target;
        this.tween = tween;
        _processingVars = vars; // gets swapped inside _calculateTweenDuration() if there's a function-based value encountered (to avoid double-calling it)
        let cache = target._gsap, getVal = cache.get, dur = vars.duration, durIsObj = _isObject(dur), preventOvershoot = vars.preventOvershoot || durIsObj && dur.overshoot === 0, resistance = _getNumOrDefault(vars, "resistance", _config.resistance), duration = _isNumber(dur) ? dur : _calculateTweenDuration(target, vars, durIsObj && dur.max || 10, durIsObj && dur.min || 0.2, durIsObj && "overshoot" in dur ? +dur.overshoot : preventOvershoot ? 0 : 1, true), p, curProp, curVal, unit, velocity, change1, end, change2, linkedProps;
        vars = _processingVars;
        _processingVars = 0;
        //when there are linkedProps (typically "x,y" where snapping has to factor in multiple properties, we must first populate an object with all of those end values, then feed it to the function that make any necessary alterations. So the point of this first loop is to simply build an object (like {x:100, y:204.5}) for feeding into that function which we'll do later in the "real" loop.
        linkedProps = _processLinkedProps(target, vars, getVal, resistance);
        for(p in vars){
            if (!_reservedProps[p]) {
                curProp = vars[p];
                _isFunction(curProp) && (curProp = curProp(index, target, targets));
                if (_isNumber(curProp)) {
                    velocity = curProp;
                } else if (_isObject(curProp) && !isNaN(curProp.velocity)) {
                    velocity = +curProp.velocity;
                } else {
                    if (tracker && tracker.isTracking(p)) {
                        velocity = tracker.get(p);
                    } else {
                        console.warn("ERROR: No velocity was defined for " + target + " property: " + p);
                    }
                }
                change1 = _calculateChange(velocity, duration);
                change2 = 0;
                curVal = getVal(target, p);
                unit = _getUnit(curVal);
                curVal = parseFloat(curVal);
                if (_isObject(curProp)) {
                    end = curVal + change1;
                    if ("end" in curProp) {
                        curProp = _parseEnd(curProp, linkedProps && p in linkedProps ? linkedProps : end, curProp.max, curProp.min, p, vars.radius, velocity);
                    }
                    if ("max" in curProp && +curProp.max < end) {
                        if (preventOvershoot || curProp.preventOvershoot) {
                            change1 = curProp.max - curVal;
                        } else {
                            change2 = curProp.max - curVal - change1;
                        }
                    } else if ("min" in curProp && +curProp.min > end) {
                        if (preventOvershoot || curProp.preventOvershoot) {
                            change1 = curProp.min - curVal;
                        } else {
                            change2 = curProp.min - curVal - change1;
                        }
                    }
                }
                this._props.push(p);
                this.styles && this.styles.save(p);
                this._pt = new PropTween(this._pt, target, p, curVal, 0, _emptyFunc, 0, cache.set(target, p, this));
                this._pt.u = unit || 0;
                this._pt.c1 = change1;
                this._pt.c2 = change2;
            }
        }
        tween.duration(duration);
        return _bonusValidated;
    },
    render (ratio, data) {
        let pt = data._pt;
        ratio = _power3(data.tween._time / data.tween._dur);
        if (ratio || !_reverting()) {
            while(pt){
                pt.set(pt.t, pt.p, _round(pt.s + pt.c1 * ratio + pt.c2 * ratio * ratio) + pt.u, pt.d, ratio);
                pt = pt._next;
            }
        } else {
            data.styles.revert();
        }
    }
};
"track,untrack,isTracking,getVelocity,getByTarget".split(",").forEach((name)=>InertiaPlugin[name] = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$VelocityTracker$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VelocityTracker"][name]);
_getGSAP() && gsap.registerPlugin(InertiaPlugin);
;
}),
"[project]/apps/web/src/lib/gsap/src/MotionPathPlugin.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MotionPathPlugin",
    ()=>MotionPathPlugin,
    "default",
    ()=>MotionPathPlugin
]);
/*!
 * MotionPathPlugin 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/paths.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/matrix.js [app-ssr] (ecmascript)");
;
;
let _xProps = "x,translateX,left,marginLeft,xPercent".split(","), _yProps = "y,translateY,top,marginTop,yPercent".split(","), _DEG2RAD = Math.PI / 180, gsap, PropTween, _getUnit, _toArray, _getStyleSaver, _reverting, _getGSAP = ()=>gsap || ("TURBOPACK compile-time value", "undefined") !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap, _populateSegmentFromArray = (segment, values, property, mode)=>{
    let l = values.length, si = mode === 2 ? 0 : mode, i = 0, v;
    for(; i < l; i++){
        segment[si] = v = parseFloat(values[i][property]);
        mode === 2 && (segment[si + 1] = 0);
        si += 2;
    }
    return segment;
}, _getPropNum = (target, prop, unit)=>parseFloat(target._gsap.get(target, prop, unit || "px")) || 0, _relativize = (segment)=>{
    let x = segment[0], y = segment[1], i;
    for(i = 2; i < segment.length; i += 2){
        x = segment[i] += x;
        y = segment[i + 1] += y;
    }
}, // feed in an array of quadratic bezier points like [{x: 0, y: 0}, ...] and it'll convert it to cubic bezier
// _quadToCubic = points => {
// 	let cubic = [],
// 		l = points.length - 1,
// 		i = 1,
// 		a, b, c;
// 	for (; i < l; i+=2) {
// 		a = points[i-1];
// 		b = points[i];
// 		c = points[i+1];
// 		cubic.push(a, {x: (2 * b.x + a.x) / 3, y: (2 * b.y + a.y) / 3}, {x: (2 * b.x + c.x) / 3, y: (2 * b.y + c.y) / 3});
// 	}
// 	cubic.push(points[l]);
// 	return cubic;
// },
_segmentToRawPath = (plugin, segment, target, x, y, slicer, vars, unitX, unitY)=>{
    if (vars.type === "cubic") {
        segment = [
            segment
        ];
    } else {
        vars.fromCurrent !== false && segment.unshift(_getPropNum(target, x, unitX), y ? _getPropNum(target, y, unitY) : 0);
        vars.relative && _relativize(segment);
        let pointFunc = y ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointsToSegment"] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["flatPointsToSegment"];
        segment = [
            pointFunc(segment, vars.curviness)
        ];
    }
    segment = slicer(_align(segment, target, vars));
    _addDimensionalPropTween(plugin, target, x, segment, "x", unitX);
    y && _addDimensionalPropTween(plugin, target, y, segment, "y", unitY);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cacheRawPathMeasurements"])(segment, vars.resolution || (vars.curviness === 0 ? 20 : 12)); //when curviness is 0, it creates control points right on top of the anchors which makes it more sensitive to resolution, thus we change the default accordingly.
}, _emptyFunc = (v)=>v, _numExp = /[-+\.]*\d+\.?(?:e-|e\+)?\d*/g, _originToPoint = (element, origin, parentMatrix)=>{
    let m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(element), x = 0, y = 0, svg;
    if ((element.tagName + "").toLowerCase() === "svg") {
        svg = element.viewBox.baseVal;
        svg.width || (svg = {
            width: +element.getAttribute("width"),
            height: +element.getAttribute("height")
        });
    } else {
        svg = origin && element.getBBox && element.getBBox();
    }
    if (origin && origin !== "auto") {
        x = origin.push ? origin[0] * (svg ? svg.width : element.offsetWidth || 0) : origin.x;
        y = origin.push ? origin[1] * (svg ? svg.height : element.offsetHeight || 0) : origin.y;
    }
    return parentMatrix.apply(x || y ? m.apply({
        x: x,
        y: y
    }) : {
        x: m.e,
        y: m.f
    });
}, _getAlignMatrix = (fromElement, toElement, fromOrigin, toOrigin)=>{
    let parentMatrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(fromElement.parentNode, true, true), m = parentMatrix.clone().multiply((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(toElement)), fromPoint = _originToPoint(fromElement, fromOrigin, parentMatrix), { x, y } = _originToPoint(toElement, toOrigin, parentMatrix), p;
    m.e = m.f = 0;
    if (toOrigin === "auto" && toElement.getTotalLength && toElement.tagName.toLowerCase() === "path") {
        p = toElement.getAttribute("d").match(_numExp) || [];
        p = m.apply({
            x: +p[0],
            y: +p[1]
        });
        x += p.x;
        y += p.y;
    }
    //if (p || (toElement.getBBox && fromElement.getBBox && toElement.ownerSVGElement === fromElement.ownerSVGElement)) {
    if (p) {
        p = m.apply(toElement.getBBox());
        x -= p.x;
        y -= p.y;
    }
    m.e = x - fromPoint.x;
    m.f = y - fromPoint.y;
    return m;
}, _align = (rawPath, target, { align, matrix, offsetX, offsetY, alignOrigin })=>{
    let x = rawPath[0][0], y = rawPath[0][1], curX = _getPropNum(target, "x"), curY = _getPropNum(target, "y"), alignTarget, m, p;
    if (!rawPath || !rawPath.length) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRawPath"])("M0,0L0,0");
    }
    if (align) {
        if (align === "self" || (alignTarget = _toArray(align)[0] || target) === target) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformRawPath"])(rawPath, 1, 0, 0, 1, curX - x, curY - y);
        } else {
            if (alignOrigin && alignOrigin[2] !== false) {
                gsap.set(target, {
                    transformOrigin: alignOrigin[0] * 100 + "% " + alignOrigin[1] * 100 + "%"
                });
            } else {
                alignOrigin = [
                    _getPropNum(target, "xPercent") / -100,
                    _getPropNum(target, "yPercent") / -100
                ];
            }
            m = _getAlignMatrix(target, alignTarget, alignOrigin, "auto");
            p = m.apply({
                x: x,
                y: y
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformRawPath"])(rawPath, m.a, m.b, m.c, m.d, curX + m.e - (p.x - m.e), curY + m.f - (p.y - m.f));
        }
    }
    if (matrix) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformRawPath"])(rawPath, matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    } else if (offsetX || offsetY) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformRawPath"])(rawPath, 1, 0, 0, 1, offsetX || 0, offsetY || 0);
    }
    return rawPath;
}, _addDimensionalPropTween = (plugin, target, property, rawPath, pathProperty, forceUnit)=>{
    let cache = target._gsap, harness = cache.harness, alias = harness && harness.aliases && harness.aliases[property], prop = alias && alias.indexOf(",") < 0 ? alias : property, pt = plugin._pt = new PropTween(plugin._pt, target, prop, 0, 0, _emptyFunc, 0, cache.set(target, prop, plugin));
    pt.u = _getUnit(cache.get(target, prop, forceUnit)) || 0;
    pt.path = rawPath;
    pt.pp = pathProperty;
    plugin._props.push(prop);
}, _sliceModifier = (start, end)=>(rawPath)=>start || end !== 1 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sliceRawPath"])(rawPath, start, end) : rawPath;
const MotionPathPlugin = {
    version: "3.15.0",
    name: "motionPath",
    register (core, Plugin, propTween) {
        gsap = core;
        _getUnit = gsap.utils.getUnit;
        _toArray = gsap.utils.toArray;
        _getStyleSaver = gsap.core.getStyleSaver;
        _reverting = gsap.core.reverting || function() {};
        PropTween = propTween;
    },
    init (target, vars, tween) {
        if (!gsap) {
            console.warn("Please gsap.registerPlugin(MotionPathPlugin)");
            return false;
        }
        if (!(typeof vars === "object" && !vars.style) || !vars.path) {
            vars = {
                path: vars
            };
        }
        let rawPaths = [], { path, autoRotate, unitX, unitY, x, y } = vars, firstObj = path[0], slicer = _sliceModifier(vars.start, "end" in vars ? vars.end : 1), rawPath, p;
        this.rawPaths = rawPaths;
        this.target = target;
        this.tween = tween;
        this.styles = _getStyleSaver && _getStyleSaver(target, "transform");
        if (this.rotate = autoRotate || autoRotate === 0) {
            this.rOffset = parseFloat(autoRotate) || 0;
            this.radians = !!vars.useRadians;
            this.rProp = vars.rotation || "rotation"; // rotation property
            this.rSet = target._gsap.set(target, this.rProp, this); // rotation setter
            this.ru = _getUnit(target._gsap.get(target, this.rProp)) || 0; // rotation units
        }
        if (Array.isArray(path) && !("closed" in path) && typeof firstObj !== "number") {
            for(p in firstObj){
                if (!x && ~_xProps.indexOf(p)) {
                    x = p;
                } else if (!y && ~_yProps.indexOf(p)) {
                    y = p;
                }
            }
            if (x && y) {
                rawPaths.push(_segmentToRawPath(this, _populateSegmentFromArray(_populateSegmentFromArray([], path, x, 0), path, y, 1), target, x, y, slicer, vars, unitX || _getUnit(path[0][x]), unitY || _getUnit(path[0][y])));
            } else {
                x = y = 0;
            }
            for(p in firstObj){
                p !== x && p !== y && rawPaths.push(_segmentToRawPath(this, _populateSegmentFromArray([], path, p, 2), target, p, 0, slicer, vars, _getUnit(path[0][p])));
            }
        } else {
            rawPath = slicer(_align((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRawPath"])(vars.path), target, vars));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cacheRawPathMeasurements"])(rawPath, vars.resolution);
            rawPaths.push(rawPath);
            _addDimensionalPropTween(this, target, vars.x || "x", rawPath, "x", vars.unitX || "px");
            _addDimensionalPropTween(this, target, vars.y || "y", rawPath, "y", vars.unitY || "px");
        }
        tween.vars.immediateRender && this.render(tween.progress(), this);
    },
    render (ratio, data) {
        let rawPaths = data.rawPaths, i = rawPaths.length, pt = data._pt;
        if (data.tween._time || !_reverting()) {
            if (ratio > 1) {
                ratio = 1;
            } else if (ratio < 0) {
                ratio = 0;
            }
            while(i--){
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositionOnPath"])(rawPaths[i], ratio, !i && data.rotate, rawPaths[i]);
            }
            while(pt){
                pt.set(pt.t, pt.p, pt.path[pt.pp] + pt.u, pt.d, ratio);
                pt = pt._next;
            }
            data.rotate && data.rSet(data.target, data.rProp, rawPaths[0].angle * (data.radians ? _DEG2RAD : 1) + data.rOffset + data.ru, data, ratio);
        } else {
            data.styles.revert();
        }
    },
    getLength (path) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cacheRawPathMeasurements"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRawPath"])(path)).totalLength;
    },
    sliceRawPath: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sliceRawPath"],
    getRawPath: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRawPath"],
    pointsToSegment: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointsToSegment"],
    stringToRawPath: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringToRawPath"],
    rawPathToString: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rawPathToString"],
    transformRawPath: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformRawPath"],
    getGlobalMatrix: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"],
    getPositionOnPath: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositionOnPath"],
    cacheRawPathMeasurements: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cacheRawPathMeasurements"],
    convertToPath: (targets, swap)=>_toArray(targets).map((target)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["convertToPath"])(target, swap !== false)),
    convertCoordinates (fromElement, toElement, point) {
        let m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(toElement, true, true).multiply((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$matrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGlobalMatrix"])(fromElement));
        return point ? m.apply(point) : m;
    },
    getAlignMatrix: _getAlignMatrix,
    getRelativePosition (fromElement, toElement, fromOrigin, toOrigin) {
        let m = _getAlignMatrix(fromElement, toElement, fromOrigin, toOrigin);
        return {
            x: m.e,
            y: m.f
        };
    },
    arrayToRawPath (value, vars) {
        vars = vars || {};
        let segment = _populateSegmentFromArray(_populateSegmentFromArray([], value, vars.x || "x", 0), value, vars.y || "y", 1);
        vars.relative && _relativize(segment);
        return [
            vars.type === "cubic" ? segment : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$paths$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointsToSegment"])(segment, vars.curviness)
        ];
    }
};
_getGSAP() && gsap.registerPlugin(MotionPathPlugin);
;
}),
"[project]/apps/web/src/lib/gsap/src/ScrambleTextPlugin.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrambleTextPlugin",
    ()=>ScrambleTextPlugin,
    "default",
    ()=>ScrambleTextPlugin
]);
/*!
 * ScrambleTextPlugin 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/ /* eslint-disable */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/utils/strings.js [app-ssr] (ecmascript)");
;
class CharSet {
    constructor(chars){
        this.chars = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])(chars);
        this.sets = [];
        this.length = 50;
        for(let i = 0; i < 20; i++){
            this.sets[i] = _scrambleText(80, this.chars); //we create 20 strings that are 80 characters long, randomly chosen and pack them into an array. We then randomly choose the scrambled text from this array in order to greatly improve efficiency compared to creating new randomized text from scratch each and every time it's needed. This is a simple lookup whereas the other technique requires looping through as many times as there are characters needed, and calling Math.random() each time through the loop, building the string, etc.
        }
    }
    grow(newLength) {
        for(let i = 0; i < 20; i++){
            this.sets[i] += _scrambleText(newLength - this.length, this.chars);
        }
        this.length = newLength;
    }
}
let gsap, _coreInitted, _getGSAP = ()=>gsap || ("TURBOPACK compile-time value", "undefined") !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap, _bonusValidated = 1, _spacesExp = /\s+/g, _scrambleText = (length, chars)=>{
    let l = chars.length, s = "";
    while(--length > -1){
        s += chars[~~(Math.random() * l)];
    }
    return s;
}, _upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", _lower = _upper.toLowerCase(), _charsLookup = {
    upperCase: new CharSet(_upper),
    lowerCase: new CharSet(_lower),
    upperAndLowerCase: new CharSet(_upper + _lower)
}, _initCore = ()=>{
    _coreInitted = gsap = _getGSAP();
};
const ScrambleTextPlugin = {
    version: "3.15.0",
    name: "scrambleText",
    register (core, Plugin, propTween) {
        gsap = core;
        _initCore();
    },
    init (target, value, tween, index, targets) {
        _coreInitted || _initCore();
        this.prop = "innerHTML" in target ? "innerHTML" : "textContent" in target ? "textContent" : 0; // SVG text in IE doesn't have innerHTML, but it does have textContent.
        if (!this.prop) {
            return;
        }
        this.target = target;
        if (typeof value !== "object") {
            value = {
                text: value
            };
        }
        let text = value.text || value.value || "", trim = value.trim !== false, data = this, delim, maxLength, charset, splitByChars;
        data.delimiter = delim = value.delimiter || "";
        data.original = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getText"])(target).replace(_spacesExp, " ").split("&nbsp;").join(""), delim, trim);
        if (text === "{original}" || text === true || text == null) {
            text = data.original.join(delim);
        }
        data.text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])((text || "").replace(_spacesExp, " "), delim, trim);
        data.hasClass = !!(value.newClass || value.oldClass);
        data.newClass = value.newClass;
        data.oldClass = value.oldClass;
        splitByChars = delim === "";
        data.textHasEmoji = splitByChars && !!data.text.emoji;
        data.charsHaveEmoji = !!value.chars && !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])(value.chars).emoji;
        data.length = splitByChars ? data.original.length : data.original.join(delim).length;
        data.lengthDif = (splitByChars ? data.text.length : data.text.join(delim).length) - data.length;
        data.fillChar = value.fillChar || value.chars && ~value.chars.indexOf(" ") ? "&nbsp;" : "";
        data.charSet = charset = _charsLookup[value.chars || "upperCase"] || new CharSet(value.chars);
        data.speed = 0.05 / (value.speed || 1);
        data.prevScrambleTime = 0;
        data.setIndex = Math.random() * 20 | 0;
        maxLength = data.length + Math.max(data.lengthDif, 0);
        if (maxLength > charset.length) {
            charset.grow(maxLength);
        }
        data.chars = charset.sets[data.setIndex];
        data.revealDelay = value.revealDelay || 0;
        data.tweenLength = value.tweenLength !== false;
        data.tween = tween;
        data.rightToLeft = !!value.rightToLeft;
        data._props.push("scrambleText", "text");
        return _bonusValidated;
    },
    render (ratio, data) {
        let { target, prop, text, delimiter, tween, prevScrambleTime, revealDelay, setIndex, chars, charSet, length, textHasEmoji, charsHaveEmoji, lengthDif, tweenLength, oldClass, newClass, rightToLeft, fillChar, speed, original, hasClass } = data, l = text.length, time = tween._time, timeDif = time - prevScrambleTime, i, i2, startText, endText, applyNew, applyOld, str, startClass, endClass, position, r;
        if (revealDelay) {
            if (tween._from) {
                time = tween._dur - time; //invert the time for from() tweens
            }
            ratio = time === 0 ? 0 : time < revealDelay ? 0.000001 : time === tween._dur ? 1 : tween._ease((time - revealDelay) / (tween._dur - revealDelay));
        }
        if (ratio < 0) {
            ratio = 0;
        } else if (ratio > 1) {
            ratio = 1;
        }
        if (rightToLeft) {
            ratio = 1 - ratio;
        }
        i = ~~(ratio * l + 0.5);
        if (ratio) {
            if (timeDif > speed || timeDif < -speed) {
                data.setIndex = setIndex = (setIndex + (Math.random() * 19 | 0)) % 20;
                data.chars = charSet.sets[setIndex];
                data.prevScrambleTime += timeDif;
            }
            endText = chars;
        } else {
            endText = original.join(delimiter);
        }
        r = tween._from ? ratio : 1 - ratio;
        position = length + (tweenLength ? tween._from ? r * r * r : 1 - r * r * r : 1) * lengthDif;
        if (rightToLeft) {
            if (ratio === 1 && (tween._from || tween.data === "isFromStart")) {
                startText = "";
                endText = original.join(delimiter);
            } else {
                str = text.slice(i).join(delimiter);
                if (charsHaveEmoji) {
                    startText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])(endText).slice(0, position - (textHasEmoji ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])(str) : str).length + 0.5 | 0).join("");
                } else {
                    startText = endText.substr(0, position - (textHasEmoji ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])(str) : str).length + 0.5 | 0);
                }
                endText = str;
            }
        } else {
            startText = text.slice(0, i).join(delimiter);
            i2 = (textHasEmoji ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])(startText) : startText).length;
            if (charsHaveEmoji) {
                endText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"])(endText).slice(i2, position + 0.5 | 0).join("");
            } else {
                endText = endText.substr(i2, position - i2 + 0.5 | 0);
            }
        }
        if (hasClass) {
            startClass = rightToLeft ? oldClass : newClass;
            endClass = rightToLeft ? newClass : oldClass;
            applyNew = startClass && i !== 0;
            applyOld = endClass && i !== l;
            str = (applyNew ? "<span class='" + startClass + "'>" : "") + startText + (applyNew ? "</span>" : "") + (applyOld ? "<span class='" + endClass + "'>" : "") + delimiter + endText + (applyOld ? "</span>" : "");
        } else {
            str = startText + delimiter + endText;
        }
        target[prop] = fillChar === "&nbsp;" && ~str.indexOf("  ") ? str.split("  ").join("&nbsp;&nbsp;") : str;
    }
};
ScrambleTextPlugin.emojiSafeSplit = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emojiSafeSplit"];
ScrambleTextPlugin.getText = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$utils$2f$strings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getText"];
_getGSAP() && gsap.registerPlugin(ScrambleTextPlugin);
;
}),
"[project]/apps/web/src/lib/gsap/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$gsap$2f$react$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@gsap/react/src/index.js [app-ssr] (ecmascript)");
// Core & Public Plugins
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$ScrollTrigger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/ScrollTrigger.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$ScrollToPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/ScrollToPlugin.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Flip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/Flip.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Observer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/Observer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$TextPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/TextPlugin.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$CustomEase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/CustomEase.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$SplitText$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/SplitText.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$DrawSVGPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/DrawSVGPlugin.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$MorphSVGPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/MorphSVGPlugin.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$ScrollSmoother$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/ScrollSmoother.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$Draggable$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/Draggable.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$InertiaPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/InertiaPlugin.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$MotionPathPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/MotionPathPlugin.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$src$2f$ScrambleTextPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/src/ScrambleTextPlugin.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Register plugins on client side
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
;
}),
"[project]/apps/web/src/components/ui/badge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
            outline: "text-foreground border-border",
            evergreen: "border-transparent bg-[var(--color-evergreen-600)] text-white shadow-xs",
            amber: "border-transparent bg-[var(--color-amber-500)] text-[var(--color-ink-900)] font-medium",
            mist: "border-transparent bg-[var(--color-mist-100)] text-[var(--color-forest-800)] font-medium"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
function Badge({ className, variant, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/badge.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/apps/web/src/components/home/HeroSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HeroSection",
    ()=>HeroSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$gsap$2f$react$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@gsap/react/src/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$gsap$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/lib/gsap/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals> <export default as gsap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$bilingual$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/bilingual.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.mjs [app-ssr] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.mjs [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-ssr] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$percent$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Percent$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/percent.mjs [app-ssr] (ecmascript) <export default as Percent>");
"use client";
;
;
;
;
;
;
;
;
;
function HeroSection() {
    const containerRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    const heroTextRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    const isoCardsRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$gsap$2f$react$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGSAP"])(()=>{
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;
        const tl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline({
            defaults: {
                ease: "power3.out"
            }
        });
        tl.from(heroTextRef.current?.children || [], {
            y: 24,
            opacity: 0,
            stagger: 0.12,
            duration: 0.8
        }).from(isoCardsRef.current?.children || [], {
            y: 40,
            opacity: 0,
            rotateX: 15,
            rotateY: -15,
            stagger: 0.15,
            duration: 0.9
        }, "-=0.5");
    }, {
        scope: containerRef
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: containerRef,
        className: "relative overflow-hidden py-12 md:py-20 px-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: heroTextRef,
                    className: "lg:col-span-7 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                            variant: "mist",
                            className: "px-3.5 py-1 text-xs",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$bilingual$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Bilingual"], {
                                en: "Official Wholesale Stationers",
                                ur: "آفیشل ہول سیل اسٹیشنرز",
                                layout: "inline"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                lineNumber: 51,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-ink-900)] leading-[1.1]",
                            children: "Direct Wholesale Stationery for Registered Shops & Offices"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl",
                            children: "Streamline your inventory with high-grade paper rims, registers, pens, and office supplies. Verified business accounts unlock tiered pricing and flexible payment terms."
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center gap-4 pt-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/catalogue",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "lg",
                                        variant: "default",
                                        className: "rounded-full gap-2 px-6 shadow-md",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                                                className: "size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                                lineNumber: 65,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$bilingual$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Bilingual"], {
                                                en: "Browse Catalogue",
                                                ur: "کیٹلاگ دیکھیں",
                                                layout: "inline"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                                lineNumber: 66,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/register",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "lg",
                                        variant: "outline",
                                        className: "rounded-full gap-2 px-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Apply for Wholesale Account"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                                lineNumber: 72,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                className: "size-4"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                                lineNumber: 73,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 71,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                    lineNumber: 70,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pt-6 border-t border-border/60 grid grid-cols-3 gap-4 text-xs text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                            className: "size-4 text-[var(--color-evergreen-600)] shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                            lineNumber: 81,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Verified Credit Terms"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                            lineNumber: 82,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                            className: "size-4 text-[var(--color-evergreen-600)] shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                            lineNumber: 85,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Direct Zone Delivery"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                            lineNumber: 86,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                    lineNumber: 84,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$percent$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Percent$3e$__["Percent"], {
                                            className: "size-4 text-[var(--color-evergreen-600)] shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                            lineNumber: 89,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Tiered Wholesale Rates"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                            lineNumber: 90,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                    lineNumber: 49,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "lg:col-span-5 relative flex justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: isoCardsRef,
                        className: "relative w-full max-w-sm h-80 flex items-center justify-center [perspective:1000px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 right-4 w-64 p-5 rounded-2xl bg-[var(--color-evergreen-600)] text-white shadow-xl transform [rotateX(12deg)] [rotateY(-12deg)] transition-transform hover:scale-105",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] font-bold uppercase tracking-wider text-[var(--color-mist-100)] mb-1",
                                        children: "Bulk Stock"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "font-heading font-semibold text-base mb-1",
                                        children: "A4 Photocopy Rims"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-white/80",
                                        children: "80gsm 500-sheet packs in stock."
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 text-right font-heading font-bold text-lg text-[var(--color-amber-500)]",
                                        children: "Rs. 1,250"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                lineNumber: 102,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-20 left-0 w-64 p-5 rounded-2xl bg-background border border-border shadow-xl transform [rotateX(12deg)] [rotateY(-12deg)] transition-transform hover:scale-105",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] font-bold uppercase tracking-wider text-[var(--color-evergreen-600)] mb-1",
                                        children: "Shop Registers"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "font-heading font-semibold text-base mb-1",
                                        children: "Bahi Khata 400P"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 118,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: "Bound accounting books."
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 119,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 text-right font-heading font-bold text-lg text-[var(--color-evergreen-600)]",
                                        children: "Rs. 480"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                        lineNumber: 120,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute bottom-4 right-8 glass px-4 py-2 rounded-full border border-[var(--glass-border)] text-xs font-semibold text-[var(--color-ink-900)] shadow-lg",
                                children: "✨ 100% Genuine Stationery"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                                lineNumber: 126,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/home/HeroSection.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/content/mock/products.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockCategories",
    ()=>mockCategories,
    "mockProducts",
    ()=>mockProducts
]);
const mockCategories = [
    {
        id: "cat-paper",
        name: "Paper & Notebooks",
        nameUrdu: "کاغذ اور کاپیاں"
    },
    {
        id: "cat-pens",
        name: "Pens & Writing",
        nameUrdu: "قلم اور روشنائی"
    },
    {
        id: "cat-files",
        name: "Files & Folders",
        nameUrdu: "فائلیں اور فولڈرز"
    },
    {
        id: "cat-office",
        name: "Office Supplies",
        nameUrdu: "دفتر کا سامان"
    },
    {
        id: "cat-cutting",
        name: "Cutting & Tools",
        nameUrdu: "کٹنگ اور ٹولز"
    },
    {
        id: "cat-art",
        name: "Art & Drawing",
        nameUrdu: "ڈائری اور آرٹ"
    }
];
const mockProducts = [
    {
        id: "prod-1",
        name: "Evergreen A4 Copy Paper (80gsm, 500 Sheets)",
        nameUrdu: "ایور گرین A4 فوٹو کاپی پیپر",
        shopName: "A4 Rims Pack",
        categoryId: "cat-paper",
        description: "Premium bright white 80gsm A4 paper ideal for high-speed photocopying and laser printing.",
        basePrice: 1250,
        sku: "EVG-A4-80G",
        isArchived: false,
        purchaseType: "bulk",
        stockStatus: "IN_STOCK",
        currentQuantity: 120,
        createdAt: "2026-01-15T00:00:00Z",
        updatedAt: "2026-07-20T00:00:00Z"
    },
    {
        id: "prod-2",
        name: "Hardcover Register Notebook (400 Pages)",
        nameUrdu: "ہارڈ کور کاپی رجسٹر",
        shopName: "Bahi Khata Register",
        categoryId: "cat-paper",
        description: "Durable bound register for accounting, shop entries, and record keeping.",
        basePrice: 480,
        sku: "REG-HC-400P",
        isArchived: false,
        purchaseType: "both",
        stockStatus: "IN_STOCK",
        currentQuantity: 45,
        createdAt: "2026-02-10T00:00:00Z",
        updatedAt: "2026-07-22T00:00:00Z"
    },
    {
        id: "prod-3",
        name: "Blue Gel Pen Box (10 Pieces)",
        nameUrdu: "بلیو جیل پین باکس",
        shopName: "Gel Pen Pack",
        categoryId: "cat-pens",
        description: "Smooth 0.7mm quick-dry blue ink gel pens with comfortable rubberized grip.",
        basePrice: 350,
        sku: "PEN-GEL-BLU-10",
        isArchived: false,
        purchaseType: "both",
        stockStatus: "IN_STOCK",
        currentQuantity: 80,
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: "2026-07-21T00:00:00Z"
    },
    {
        id: "prod-4",
        name: "Heavy Duty Lever Arch Box File",
        nameUrdu: "لیور آرچ باکس فائل",
        shopName: "Office Box File",
        categoryId: "cat-files",
        description: "Metal reinforced spine 75mm box file for document archiving and long-term storage.",
        basePrice: 380,
        sku: "FIL-BOX-75MM",
        isArchived: false,
        purchaseType: "individual",
        stockStatus: "LOW_STOCK",
        currentQuantity: 8,
        createdAt: "2026-01-20T00:00:00Z",
        updatedAt: "2026-07-24T00:00:00Z"
    },
    {
        id: "prod-5",
        name: "Desktop Stapler #24/6 with 1000 Pins",
        nameUrdu: "ڈیسک ٹاپ اسٹیپلر پلس پنیں",
        shopName: "Stapler Machine",
        categoryId: "cat-office",
        description: "Steel mechanism desktop stapler with 30-sheet capacity and starter pin box.",
        basePrice: 290,
        sku: "STP-DESK-246",
        isArchived: false,
        purchaseType: "individual",
        stockStatus: "OUT_OF_STOCK",
        currentQuantity: 0,
        createdAt: "2026-02-15T00:00:00Z",
        updatedAt: "2026-07-23T00:00:00Z"
    },
    {
        id: "prod-6",
        name: "Heavy Duty Paper Cutter Knife (18mm)",
        nameUrdu: "پیپر کٹر چاقو",
        shopName: "Cutter Knife",
        categoryId: "cat-cutting",
        description: "Auto-lock snap-off blade cutter knife for precision paper and cardboard trimming.",
        basePrice: 180,
        sku: "CUT-KNIFE-18",
        isArchived: false,
        purchaseType: "both",
        stockStatus: "IN_STOCK",
        currentQuantity: 60,
        createdAt: "2026-04-10T00:00:00Z",
        updatedAt: "2026-07-19T00:00:00Z"
    }
];
}),
"[project]/apps/web/src/components/ui/card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-150 hover:shadow-md", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/card.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 p-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/card.tsx",
        lineNumber: 23,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("font-heading text-lg font-semibold leading-none tracking-tight text-[var(--color-ink-900)]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/card.tsx",
        lineNumber: 35,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/card.tsx",
        lineNumber: 50,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/card.tsx",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/card.tsx",
        lineNumber: 70,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
CardFooter.displayName = "CardFooter";
;
}),
"[project]/apps/web/src/components/ui/product-icon-block.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductIconBlock",
    ()=>ProductIconBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.mjs [app-ssr] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.mjs [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$tool$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PenTool$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-tool.mjs [app-ssr] (ecmascript) <export default as PenTool>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scissors.mjs [app-ssr] (ecmascript) <export default as Scissors>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bookmark.mjs [app-ssr] (ecmascript) <export default as Bookmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const categoryIconMap = {
    paper: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"],
    pens: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$tool$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PenTool$3e$__["PenTool"],
    office: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
    files: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"],
    cutting: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"],
    art: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"],
    general: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
};
const sizeClasses = {
    sm: "p-3 [&_svg]:size-5",
    md: "p-4 [&_svg]:size-8",
    lg: "p-6 [&_svg]:size-12",
    xl: "p-8 [&_svg]:size-16"
};
const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: ""
};
/**
 * FR-CAT-01: Solid-Evergreen Geometric Icon Block
 * Represents products without product photography using clean brand geometry.
 */ function ProductIconBlock({ icon, category = "general", size = "md", aspectRatio = "square", className, ...props }) {
    const IconComponent = icon || categoryIconMap[category] || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative flex items-center justify-center overflow-hidden rounded-lg bg-[var(--color-evergreen-600)] text-white shadow-xs transition-transform duration-200 hover:scale-[1.02]", sizeClasses[size], aspectClasses[aspectRatio], className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_70%)] pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/product-icon-block.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -bottom-4 -right-4 size-20 rounded-full bg-white/5 pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/product-icon-block.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(IconComponent, {
                className: "relative z-10 opacity-95 transition-transform duration-200 group-hover:scale-110"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/product-icon-block.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/product-icon-block.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/apps/web/src/lib/pricing.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatPKR",
    ()=>formatPKR,
    "resolveDisplayPrice",
    ()=>resolveDisplayPrice
]);
function resolveDisplayPrice(product, context) {
    if (!context?.isApprovedBusiness || !context.businessDiscountPercent) {
        return product.basePrice;
    }
    const discountAmount = product.basePrice * context.businessDiscountPercent / 100;
    const resolvedPrice = Math.max(0, product.basePrice - discountAmount);
    return Math.round(resolvedPrice);
}
function formatPKR(amount) {
    return `Rs. ${amount.toLocaleString("en-PK")}`;
}
}),
"[project]/apps/web/src/components/catalogue/ProductCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductCard",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$bilingual$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/bilingual.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$product$2d$icon$2d$block$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/product-icon-block.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$pricing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/pricing.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$hooks$2f$use$2d$cart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/hooks/use-cart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.mjs [app-ssr] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$ring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellRing$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell-ring.mjs [app-ssr] (ecmascript) <export default as BellRing>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-ssr] (ecmascript) <export default as Check>");
"use client";
;
;
;
;
;
;
;
;
;
;
function ProductCard({ product, pricingContext }) {
    const { addItem } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$hooks$2f$use$2d$cart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCart"])();
    const [added, setAdded] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](false);
    const [notified, setNotified] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](false);
    const resolvedPrice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$pricing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDisplayPrice"])(product, pricingContext);
    const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";
    const isLowStock = product.stockStatus === "LOW_STOCK";
    const handleAddToCart = ()=>{
        addItem({
            id: product.id,
            title: product.name,
            price: resolvedPrice,
            unit: "Piece"
        });
        setAdded(true);
        setTimeout(()=>setAdded(false), 1500);
    };
    const handleNotifyMe = ()=>{
        setNotified(true);
        setTimeout(()=>setNotified(false), 2000);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
        className: "group relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "p-4 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$product$2d$icon$2d$block$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProductIconBlock"], {
                                category: product.categoryId.replace("cat-", ""),
                                size: "md",
                                aspectRatio: "video",
                                className: "w-full rounded-xl"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-2.5 right-2.5 flex items-center gap-1.5",
                                children: isOutOfStock ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "destructive",
                                    className: "text-[10px]",
                                    children: "Out of Stock"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 59,
                                    columnNumber: 15
                                }, this) : isLowStock ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "amber",
                                    className: "text-[10px]",
                                    children: [
                                        "Low Stock (",
                                        product.currentQuantity,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 63,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "evergreen",
                                    className: "text-[10px]",
                                    children: "In Stock"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 67,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: [
                            product.shopName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-semibold tracking-wider text-muted-foreground uppercase",
                                children: product.shopName
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                lineNumber: 77,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "font-heading font-semibold text-sm leading-snug text-[var(--color-ink-900)] line-clamp-2",
                                children: product.name
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            product.nameUrdu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                dir: "rtl",
                                className: "font-urdu text-xs text-muted-foreground line-clamp-1",
                                children: product.nameUrdu
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardFooter"], {
                className: "p-4 pt-0 flex items-center justify-between gap-2 border-t border-border/40 mt-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-muted-foreground font-medium",
                                children: "Price"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-heading font-bold text-base text-[var(--color-evergreen-600)]",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$pricing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPKR"])(resolvedPrice)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    isOutOfStock ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        size: "xs",
                        variant: "outline",
                        onClick: handleNotifyMe,
                        disabled: notified,
                        className: "rounded-full gap-1 text-[11px]",
                        children: notified ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                    className: "size-3 text-[var(--color-evergreen-600)]"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 112,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Opted In"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 113,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$ring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellRing$3e$__["BellRing"], {
                                    className: "size-3"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 117,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Notify Me"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 118,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        size: "xs",
                        variant: added ? "secondary" : "default",
                        onClick: handleAddToCart,
                        className: "rounded-full gap-1 text-[11px]",
                        children: added ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                    className: "size-3"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 131,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Added"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 132,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                                    className: "size-3"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 136,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$bilingual$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Bilingual"], {
                                    en: "Add",
                                    ur: "شامل کریں",
                                    layout: "inline"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                                    lineNumber: 137,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                        lineNumber: 123,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/catalogue/ProductCard.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/motion/stagger-list.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StaggerList",
    ()=>StaggerList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/**
 * StaggerList Component
 * Capped stagger wrapper for lists/grids enforcing total stagger duration < 300ms
 * for clean non-jarring UI micro-animations and accessibility compliance.
 */ function StaggerList({ staggerDelay = 0.04, maxTotalStagger = 0.28, children, className, ...props }) {
    const shouldReduceMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const childArray = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].toArray(children);
    const totalCount = childArray.length;
    // Calculate actual per-item stagger so total never exceeds maxTotalStagger cap
    const effectiveStagger = totalCount > 1 ? Math.min(staggerDelay, maxTotalStagger / totalCount) : staggerDelay;
    const containerVariants = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : effectiveStagger
            }
        }
    };
    const itemVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 8
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0.05 : 0.2,
                ease: "easeOut"
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
        variants: containerVariants,
        initial: "hidden",
        animate: "visible",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(className),
        ...props,
        children: childArray.map((child, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                variants: itemVariants,
                children: child
            }, idx, false, {
                fileName: "[project]/apps/web/src/components/motion/stagger-list.tsx",
                lineNumber: 62,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/motion/stagger-list.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/apps/web/src/components/ui/tabs.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tabs",
    ()=>Tabs,
    "TabsContent",
    ()=>TabsContent,
    "TabsList",
    ()=>TabsList,
    "TabsTrigger",
    ()=>TabsTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const TabsContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"](null);
function useTabs() {
    const context = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used within a <Tabs /> container");
    }
    return context;
}
function Tabs({ defaultValue, value: controlledValue, onValueChange, className, children, ...props }) {
    const [uncontrolledValue, setUncontrolledValue] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](defaultValue ?? "");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    const handleValueChange = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((newValue)=>{
        if (!isControlled) {
            setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
    }, [
        isControlled,
        onValueChange
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TabsContext.Provider, {
        value: {
            value,
            onValueChange: handleValueChange
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-full", className),
            ...props,
            children: children
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ui/tabs.tsx",
            lineNumber: 51,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/tabs.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
function TabsList({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/tabs.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
function TabsTrigger({ className, value, children, ...props }) {
    const { value: selectedValue, onValueChange } = useTabs();
    const isSelected = selectedValue === value;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        role: "tab",
        "aria-selected": isSelected,
        onClick: ()=>onValueChange(value),
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", isSelected ? "bg-background text-foreground shadow-xs font-semibold" : "hover:text-foreground hover:bg-background/40", className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/tabs.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
function TabsContent({ className, value, children, ...props }) {
    const { value: selectedValue } = useTabs();
    if (selectedValue !== value) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "tabpanel",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/tabs.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/apps/web/src/components/home/FeaturedSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeaturedSection",
    ()=>FeaturedSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$content$2f$mock$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/content/mock/products.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$catalogue$2f$ProductCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/catalogue/ProductCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$motion$2f$stagger$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/motion/stagger-list.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/tabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.mjs [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-ssr] (ecmascript) <export default as User>");
"use client";
;
;
;
;
;
;
;
function FeaturedSection() {
    const [pricingMode, setPricingMode] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"]("guest");
    const pricingContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>{
        return pricingMode === "wholesale" ? {
            isApprovedBusiness: true,
            businessDiscountPercent: 15
        } : {
            isApprovedBusiness: false
        };
    }, [
        pricingMode
    ]);
    const restockedProducts = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$content$2f$mock$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockProducts"].slice(0, 4);
    const bestsellerProducts = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$content$2f$mock$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockProducts"].slice(2, 6);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "py-12 px-6 bg-card/30 border-t border-border/40",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-6xl space-y-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                            className: "size-4 text-[var(--color-amber-500)]"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                            lineNumber: 31,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]",
                                            children: "PRD §5.1 Restocked & Highlights"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                            lineNumber: 32,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                    lineNumber: 30,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-900)]",
                                    children: "Featured Stationery Products"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                    lineNumber: 36,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-xl bg-background border border-border shadow-xs",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-medium text-muted-foreground px-2",
                                    children: "Pricing View:"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setPricingMode("guest"),
                                            className: `flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${pricingMode === "guest" ? "bg-[var(--color-ink-900)] text-white shadow-xs" : "text-muted-foreground hover:bg-muted"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                    className: "size-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                                    lineNumber: 54,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Guest List"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                                    lineNumber: 55,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                            lineNumber: 45,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setPricingMode("wholesale"),
                                            className: `flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${pricingMode === "wholesale" ? "bg-[var(--color-evergreen-600)] text-white shadow-xs" : "text-muted-foreground hover:bg-muted"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                    className: "size-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Approved Business (15% Tier)"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                            lineNumber: 57,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                    lineNumber: 44,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tabs"], {
                    defaultValue: "restocked",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsList"], {
                            className: "mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                    value: "restocked",
                                    children: "Restocked & New Items"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                    lineNumber: 76,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                    value: "bestsellers",
                                    children: "Catalogue Bestsellers"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "restocked",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$motion$2f$stagger$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StaggerList"], {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
                                children: restockedProducts.map((product)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$catalogue$2f$ProductCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProductCard"], {
                                        product: product,
                                        pricingContext: pricingContext
                                    }, product.id, false, {
                                        fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                        lineNumber: 83,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "bestsellers",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$motion$2f$stagger$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StaggerList"], {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
                                children: bestsellerProducts.map((product)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$catalogue$2f$ProductCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProductCard"], {
                                        product: product,
                                        pricingContext: pricingContext
                                    }, product.id, false, {
                                        fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                        lineNumber: 91,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                            lineNumber: 88,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/home/FeaturedSection.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_0eq1s-c._.js.map