/*!
 * rivet-uits - @version 1.4.0

 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Element.closest() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 */
if (!Element.prototype.closest) {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }
  Element.prototype.closest = function (s) {
    var el = this;
    var ancestor = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (ancestor.matches(s)) return ancestor;
      ancestor = ancestor.parentElement;
    } while (ancestor !== null);
    return null;
  };
}

/**
 * CustomEvent Polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */

(function () {

  if (typeof window.CustomEvent === "function") return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

/**
 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 *
 * @param {HTMLElement} element
 * An HTML Element used to emmit the event from
 * @param {String} attributeId
 * A data attribute with a unique value
 * @param {String} eventName
 * A unique name for the custom event
 */
var fireCustomEvent = function (element, attributeId, eventName) {
  var event = new CustomEvent(eventName, {
    bubbles: true,
    detail: {
      name: function () {
        return element.getAttribute(attributeId);
      }
    }
  });

  // Distpatch the event
  element.dispatchEvent(event);
}

/**
 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

var Alert = (function() {
  'use strict';

  // Selectors
  
  /**
   * DEPRECATED: .rvt-alert__dismiss will be removed in the future in favor of
   * using the more consistent data attribute data-alert-close.
   */
  var SELECTORS = '[data-alert-close], .rvt-alert__dismiss';

  /**
   * Kicks off the Alert component and sets up all event listeners
   *
   * @param {HTMLElement} context - An optional DOM element that the
   * alert can be initialized on. All event listeners will be attached
   * to this element. Usually best to just leave it to default
   * to the document.
   */
  function init(context) {
    // Optional element to bind the event listeners to
    if (context === undefined) {
      context = document;
    }

    // Destroy any currently initialized alerts
    destroy(context);

    document.addEventListener('click', _handleClick, false);
  }

  /**
   * Cleans up any currently initialized Alerts
   *
   * @param {HTMLElement} context - An optional DOM element. This only
   * needs to be passed in if a DOM element was passed to the init()
   * function. If so, the element passed in must be the same element
   * that was passed in at initialization so that the event listeners can
   * be properly removed.
   */
  function destroy(context) {
    if (context === undefined) {
      context = document;
    }

    document.removeEventListener('click', _handleClick, false);
  }

  var _handleClick = function(event) {
    var dismissButton = event.target.closest(SELECTORS);

    // If the target wasn't the dismiss button bail.
    if (!dismissButton) return;

    // Get the parent node of the dsimiss button i.e. the alert container
    var alertThatWasClicked = dismissButton.parentNode;

    dismissAlert(alertThatWasClicked);
  };

  /**
   * Dismisses the alert
   * @param {String} id - A unique string used for the alert's id attribute
   * @param {Function} callback - A function that is executed after alert
   * is closed.
   */
  function dismissAlert(id, callback) {
    /**
     * DEPRECATED: This is to add backwards compatibility for the older API
     * where you needed to pass in the alert Object/HTMLElement. This should
     * be deprecated in the next major version.
     */
    if (typeof id === 'object' && id.nodeType === 1) {
      var alertEl = id;
      id = alertEl.getAttribute('id');

      // if an id isn't provided try aria-labelledby
      if (!id) {
        id = alertEl.getAttribute('aria-labelledby');
      }

      // if aria-labelledby and id aren't provided throw an error
      if (!id) {
        throw new Error(
          'Please proved an id attribute for the alert you want to dismiss.'
        );
      }
    }

    var alert = document.querySelector('[aria-labelledby="' + id + '"]');

    if (!alert) {
      alert = document.getElementById(id);
    }

    if (!alert) {
      throw new Error(
        'Could not find an alert with the id of ' + id + ' to dismiss.'
      );
    }

    alert.parentNode.removeChild(alert);

    if (callback && typeof callback === 'function') {
      callback();
    }
  }

  return {
    init: init,
    destroy: destroy,
    dismiss: dismissAlert
  };
})();

/**
 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

var Drawer = (function() {
  'use strict';

  var KEYS = {
    up: 38,
    down: 40,
    tab: 9,
    escape: 27
  };

  var ALL_FOCUSABLE_ELS = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';
  var TOGGLE_ATTRIBUTE = 'data-drawer-toggle';
  var TOGGLE_SELECTOR = '[' + TOGGLE_ATTRIBUTE + ']';

  /**
   * These variables keep track of whether the drawer is open/close.
   * They are used to help manage focus based on keyboard interaction.
   */
  var activeDrawer;
  var activeDrawerToggle;

  /**
   * @returns {Object} - An object containing references
   * to all focus-able elements, the first and last focus-able
   * elements in the drawer.
   * @param {String} id - The unique id of the drawer that you
   * are interacting with.
   */
  function _createDrawerObject(id) {
    var drawer = {};

    drawer.toggle =
      document.querySelector('[' + TOGGLE_ATTRIBUTE + '="' + id + '"]');

    drawer.menu = document.getElementById(id);

    var drawerFocusables = Array.prototype.slice.call(drawer.menu.querySelectorAll(ALL_FOCUSABLE_ELS));

    drawer.focusables = drawerFocusables;

    drawer.firstFocusable = drawerFocusables[0];

    drawer.lastFocusable = drawerFocusables[drawerFocusables.length - 1];

    return drawer;
  }

  /**
   *
   * @param {String} id - The unique id of the drawer to open
   * @param {Function} callback - An optional callback function that is
   * executed after the drawer is opened
   */
  function open(id, callback) {
    /**
     * Set up drawer object so store all the values we need to work with
     * when managing focus (e.g. all focus-able elements, first, last, etc.)
     */
    var drawer = _createDrawerObject(id);

    // Keep track of the open drawer
    activeDrawer = id;

    // Keep track of the active toggle so we can focus later
    activeDrawerToggle = drawer.toggle;


    // Open the drawer
    drawer.toggle.setAttribute('aria-expanded', 'true');

    drawer.menu.setAttribute('aria-hidden', 'false');

    // Emit a custom event that can be used as a hook for other actions
    fireCustomEvent(activeDrawerToggle, TOGGLE_ATTRIBUTE, 'drawerOpen');

    if (callback && typeof callback === 'function') {
      callback();
    }
  }

  /**
   *
   * @param {String} id - The unique id of the drawer to close
   * @param {Function} callback - An optional callback function that
   * is executed after the drawer is closed.
   */
  function close(id, callback) {
    var drawerButton = document.querySelector('[data-drawer-toggle="' + id + '"]');

    var drawer = document.getElementById(id);

    drawerButton.setAttribute('aria-expanded', 'false');

    drawer.setAttribute('aria-hidden', 'true');

    // Emit a custom event that can be used as a hook for other actions
    fireCustomEvent(drawerButton, TOGGLE_ATTRIBUTE, 'drawerClose');

    if (callback && typeof callback === 'function') {
        callback();
    }
  }

  /**
   * DEPRECATED: This was a part of the original API and should be replaced
   * with the new open() and close() methods. I don't think anyone would
   * be using this as it was more of an internal/private method, but
   * just to be sure let's deprecate it and remove it at the next
   * major version.
   * @param {HTMLButtonElement} trigger - button to toggle the drawer
   * @param {HTMLElement} target - the drawer menu
   * @param {Event} event - The event object
   */
  function toggle(trigger, target, event) {
    /**
     * Note, there's no need for the target and event parameters here if
     * all we're doing is opening/closing the drawer.
     */
    var id = trigger.getAttribute(TOGGLE_ATTRIBUTE);

    trigger.getAttribute('aria-expanded') === 'true' ? close(id) : open(id);
  }

  /**
   * Toggles drawer subnavs
   * @param {String} id - the unique id of the drawer subnav/tree toggle
   */
  function _toggleSubnav(id) {
    var subnav = document.querySelector('[data-subnav-toggle="' + id + '"]');

    var subnavMenu = document.getElementById(id);

    var isExpanded =
      subnav.getAttribute('aria-expanded') === 'true' || false;

    subnav.setAttribute('aria-expanded', !isExpanded);

    subnavMenu.setAttribute('aria-hidden', isExpanded);
  }

  /**
   * The main click event handler that gets attached to the document
   *
   * @param {Event} event
   */
  function _handleClick(event) {
    event.target.closest('.rvt-drawer') !== null ?
      event.clickedInDrawer = true :
      event.clickedInDrawer = false;

    /**
     * If the click happened inside the drawer handle subnavs, etc.
     * Using this in place of stopPropagation()
     */
    if (event.clickedInDrawer) {
      // toggle subnav
      if (event.target.closest('[data-subnav-toggle]')) {
        var toggle = event.target.closest('[data-subnav-toggle]');

        var id = toggle.getAttribute('data-subnav-toggle');

        _toggleSubnav(id);
      }

      /**
       * If the target was the bottom close button that is only visible
       * when focused, close the drawer.
       */
      var bottomCloseButton =
        event.target.closest('[data-close-drawer], .rvt-drawer__bottom-close');

      if (bottomCloseButton !== null) {
        close(activeDrawer);

        activeDrawerToggle.focus();
      }

      return;
    }

    var drawerToggle = event.target.closest(TOGGLE_SELECTOR);

    if (!drawerToggle || drawerToggle.getAttribute('aria-expanded') === 'true') {
      if (!activeDrawer) return;

      close(activeDrawer);

      return;
    }

    open(drawerToggle.getAttribute(TOGGLE_ATTRIBUTE));
  }

  /**
   * The main keydown event listeners that gets attached to the document
   * to handle all keyboard interaction.
   * @param {Event} event
   */
  function _handleKeydown(event) {
    // Handle keyboard stuff
    switch (event.keyCode) {
      case KEYS.down:

        // Check to see if the target was the drawer toggle.
        var toggle = event.target.closest(TOGGLE_SELECTOR);

        // If it was the toggle, do toggle stuff
        if (toggle && toggle !== null) {
          var id = toggle.getAttribute(TOGGLE_ATTRIBUTE);

          var drawer = _createDrawerObject(id);

          /**
           * If the drawer is already open/expanded focus the first
           * focus-able element in the drawer, otherwise open it.
           */
          drawer.toggle.getAttribute('aria-expanded') === 'true' ?
            drawer.firstFocusable.focus() :
            open(id);

          return;
        }

        /**
         * Handle the down key press when the drawer is open and a
         * focus-able element inside has focus.
         */
        if (event.target.closest('#' + activeDrawer)) {
          // Each time we create a new drawer object to work with.
          var drawer = _createDrawerObject(activeDrawer);

          // Keep track of the index of the currently focused element
          var currentIndex;

          // Filter out any focus-able that is not visible
          var currentlyVisible = drawer.focusables.filter(function(item) {
            return item.clientHeight > 0;
          });

          // Add currently visible focus-able elements to the drawer object
          drawer.visibleFocusables = currentlyVisible;

          /**
           * This keeps track of which button/focusable is focused
           * in the open drawer.
           */
          for (var i = 0; i < drawer.visibleFocusables.length; i++) {
            if (event.target === drawer.visibleFocusables[i]) {
              currentIndex = i;
            }
          }

          var nextItem = drawer.visibleFocusables[currentIndex + 1];

          // If it's the last focus-able move back to the first.
          if (!nextItem) {
            // Always return focus to the first element
            drawer.firstFocusable.focus();

            return;
          }

          nextItem.focus();
        }

        break;
      case KEYS.up:
        /**
         * Same as down handler, but in reverse. TODO: find a way to
         * refactor the up and down handler to something that determine
         * orientation and then use a generic function to handle
         * the keydown.
         */
        if (event.target.closest('#' + activeDrawer)) {
          // Each time we create a new drawer object to work with.
          var drawer = _createDrawerObject(activeDrawer);

          // Keep track of the index of the currently focused element
          var currentIndex;

          // Filter out any focus-able that is not visible
          var currentlyVisible = drawer.focusables.filter(function (item) {
            return item.clientHeight > 0;
          });

          // Add currently visible focus-able elements to the drawer object
          drawer.visibleFocusables = currentlyVisible;

          /**
           * This keeps track of which button/focusable is focused
           * in the open drawer.
           */
          for (var i = 0; i < drawer.visibleFocusables.length; i++) {
            if (event.target === drawer.visibleFocusables[i]) {
              currentIndex = i;
            }
          }

          var previousItem = drawer.visibleFocusables[currentIndex - 1];

          // If it's the last focus-able move back to the first.
          if (!previousItem) {
            // Always return focus to the first element
            drawer.lastFocusable.focus();

            return;
          }

          previousItem.focus();
        }

        break;
      case KEYS.escape:
        // Handle escape key
        if (activeDrawer) {
          close(activeDrawer);
        }

        if (activeDrawerToggle && activeDrawerToggle !== null) {
          activeDrawerToggle.focus();
        }

        /**
         * Resets the state variables so as not to interfere with other
         * Escape key handlers/interactions
         */
        activeDrawer = null;
        activeDrawerToggle = null;

      break;

      default:
      break;
    }
  }

  /**
   * Cleans up any currently initialized Drawers
   *
   * @param {HTMLElement} context - An optional DOM element. This only
   * needs to be passed in if a DOM element was passed to the init()
   * function. If so, the element passed in must be the same element
   * that was passed in at initialization so that the event listeners can
   * be properly removed.
   */
  function destroy(context) {
    if (context === undefined) {
        context = document;
    }

    document.removeEventListener('click', _handleClick, false);
    document.removeEventListener('keydown', _handleKeydown, false);
  }

  /**
   * Kicks off the Drawer component and sets up all event listeners
   *
   * @param {HTMLElement} context - An optional DOM element that the
   * drawer can be initialized on. All event listeners will be attached
   * to this element. Usually best to just leave it to default
   * to the document.
   */
  function init(context) {
    // Optional element to bind the event listeners to
    if (context === undefined) {
      context = document;
    }

    // Destroy any currently initialized drawers
    destroy(context);

    document.addEventListener('click', _handleClick, false);
    document.addEventListener('keydown', _handleKeydown, false);
  }

  return {
    init: init,
    destroy: destroy,
    open: open,
    close: close,
    toggle: toggle
  }
})();
/**
 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

var Dropdown = (function() {
  'use strict';

  /**
   * Global references
   */

  // Keeps track of the currently active toggle. Helps with focus management
  var activeToggle;
  var activeMenu;

  /**
   * Global constants
   */

  // For easy reference
  var KEYS = {
    up: 38,
    down: 40,
    tab: 9,
    escape: 27
  };

  // Anything that is focusable
  var ALL_FOCUSABLE_ELS = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';

  var MENU_SELECTOR = '.rvt-dropdown__menu';

  var TOGGLE_ATTR = 'data-dropdown-toggle';

  /**
   * @param {String} id - A unique string used for the dropdown toggle
   * element's data-dropdown-toggle attribute and the corresponding menu's
   * "id" attribute.
   * @param {Function} callback - An optional callback function that gets
   * emmitted after the menu is opened.
   */
  function openMenu(id, callback) {
    if (!id) {
      throw new Error("You must provide a unique id for the menu you're trying to open.");
    }
    // If there's an open menu, close it.
    if (activeMenu) {
      closeMenu(activeMenu);
    }

    // Set the current active menu the menu we're about to open
    activeMenu = id;

    var toggleSelector = '[' + TOGGLE_ATTR + '="' + id + '"]';

    var toggle = document.querySelector(toggleSelector);

    // If the menu was opened by clicking an associated toggle
    if (toggle && toggle !== null) {
      toggle.setAttribute('aria-expanded', 'true');

      activeToggle = toggle;
    }

    // Get the menu to be opened by id
    var menu = document.getElementById(id);

    if (!menu) {
      throw new Error('There was no menu found with an id attribute that matches the "data-dropdown-toggle" attribute on the dropdown toggle.');
    }

    // Remove the 'hidden' attribute to show the menu
    menu.setAttribute('aria-hidden', 'false');

    // Emmit a custom event that can be used as a hook for other actions
    fireCustomEvent(toggle, TOGGLE_ATTR, 'dropdownOpen');

    // Execute supplied callback function if it exists
    if (callback && typeof callback === 'function') {
      callback();
    }
  }

  /**
   * @param {String} id - A unique string associate with the dropdown's
   * "data-dropdown-toggle" and "id" attributes.
   * @param {Function} callback - An optional callback function that is
   * executed after the closeMenu method is called.
   */
  function closeMenu(id, callback) {
    if (!id) {
      throw new Error("You must provide a unique id for the menu you're trying to close.");
    }

    var toggle = document.querySelector('[' + TOGGLE_ATTR + '="' + id + '"]');

    if (toggle && toggle !== undefined) {
      toggle.setAttribute('aria-expanded', 'false');
    }

    var menu = document.getElementById(id);

    if (!menu) {
      // If the menu has been removed from the DOM as a result of some other action in the menu then bail
      if(id) {
        return 
      } else {
      // Otherwise throw an error
        throw new Error('There was no menu found with an id attribute that matches the "data-dropdown-toggle" attribute on the dropdown toggle.');
      }
    }

    menu.setAttribute('aria-hidden', 'true');

    // Emmit a custom event that can be used as a hook for other actions
    fireCustomEvent(toggle, TOGGLE_ATTR, 'dropdownClose');

    // Execute supplied callback function if it exists
    if (callback && typeof callback === 'function') {
      callback();
    }
  }

  /**
   * DEPRECATED: This adds backward compatibility for the closeAll() method
   * in before and including 1.0.0. This should be marked as deprecated
   * moving forward and removed in the next major version.
   */
  function closeAll() {
    // Find all the dropdown toggles and convert them to an array
    var allDropdownToggles =
      Array.prototype.slice.call(
        document.querySelectorAll('[' + TOGGLE_ATTR + ']')
      );

    // Find all the dropdown menus and convert them to an array
    var allDropdownMenus =
      Array.prototype.slice.call(
        document.querySelectorAll(MENU_SELECTOR)
      );

    allDropdownToggles.forEach(function(toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    });

    allDropdownMenus.forEach(function (menu) {
      menu.setAttribute('aria-hidden', 'true');
    });
  }

  /**
   * A helper function that toggles a dropdown to the opposite of it's
   * current state (opened or closed). The .toggle() method was part
   * of the original API, so we're keeping it here for backwards
   * compatibility.
   *
   * @param {String} id - A unique string associate with the dropdown's
   * "data-dropdown-toggle" and "id" attributes.
   * @param {Function} callback - An optional callback that get's executed
   * after the dropdown is either opened or closed.
   */
  function toggle(id, callback) {
    if (!id) {
      throw new Error("You must provide a unique id for the menu you're trying to toggle.");
    }

    var toggleButton = document.querySelector('[' + TOGGLE_ATTR + '="' + id + '"]');

    // Check the state of the dropdown toggle button
    var isExpanded = toggleButton.getAttribute('aria-expanded') === 'true' || false;

    /**
     * If the button is expanded/the menu is open run the close method,
     * otherwise open the menu.
     */
    isExpanded ? closeMenu(id, callback) : openMenu(id, callback);
  }

  /**
   * @param {HTMLElement} menu - An HTMLElement that contains the dropdown
   * menu options. This function returns an object that holds a reference
   * to all focusable element in the menu, the first focusable, and the
   * last focusable element
   */
  function _setUpMenu(menu) {
    var menuObject = {};

    // Create a real Array of all the focusable elements in the menu
    var menuFocusables = Array.prototype.slice.call(
      menu.querySelectorAll(ALL_FOCUSABLE_ELS)
    );

    // Create a property to hold an array of all focusables
    menuObject.all = menuFocusables;

    // Create a property with a reference to the first focusable
    menuObject.first = menuFocusables[0];

    // Create a property with a reference to the last focusable
    menuObject.last = menuFocusables[menuFocusables.length - 1];

    return menuObject;
  }

  /**
   * Event handlers
   */

  /**
   * @param {Event} event - This is function is used to handle all click
   * events on the document. It accepts the Event object, checks the target
   * to see if it is a dropdown toggle. If so, it opens the menu otherwise
   * it closes any open/active dropdown.
   */
  function _handleClick(event) {
    var toggle = event.target.closest('[' + TOGGLE_ATTR + ']');

    var menu = event.target.closest('#' + activeMenu);

    // Use this boolean on the event object in place of stopPropagation()
    if (menu && menu !== null) {
      event.clickedWithinMenu = true;
    }

    if (!toggle || toggle.getAttribute('aria-expanded') === 'true') {
      // No menu has been opened yet and the event target was not a toggle, so bail.
      if (!activeMenu) return;

      /**
       * Otherwise close the currently open menu unless the click
       * happened inside of it.
       */
      if (!event.clickedWithinMenu) {
        closeMenu(activeMenu);
      }

      return;
    }

    var dropdownId = toggle.getAttribute(TOGGLE_ATTR);

    openMenu(dropdownId);
  }

  /**
   *
   * @param {Event} event - This functions handles all keydown events on
   * the document. It accepts the event object, determines which keys were
   * pressed and preforms the appropriate actions. Used to handle
   * keyboard navigation.
   */
  function _handleKeydown(event) {
    switch (event.keyCode) {
      // Handle down key
      case KEYS.down:
        var toggle = event.target.closest('[' + TOGGLE_ATTR + ']');

        /**
         * If you were focused on the dropdown toggle
         */
        if (toggle && toggle !== null) {
          var dropdownId = toggle.getAttribute(TOGGLE_ATTR);

          var menu = document.getElementById(dropdownId);

          // If your focused on the toggle button and the menu is open.
          if (toggle.getAttribute('aria-expanded') === 'true') {
            var currentMenu = _setUpMenu(menu);

            currentMenu.first.focus();
          }

          openMenu(dropdownId);
        }

        /**
         * Handle down arrow key when inside the open menu.
         */
        if (event.target.closest('#' + activeMenu) !== null) {
          var theMenu = event.target.closest('#' + activeMenu);

          var currentMenu = _setUpMenu(theMenu);

          var currentIndex;

          /**
           * This keeps track of which button/focusable is focused in the open menu
           */
          for (var i = 0; i < currentMenu.all.length; i++) {
            if (event.target == currentMenu.all[i]) {
              currentIndex = i;
            }
          }

          var nextItem = currentMenu.all[currentIndex + 1];

          if (!nextItem) {
            currentMenu.first.focus();

            return;
          }

          nextItem.focus();
        }

        break;

      case KEYS.up:
        /**
         * TODO: This needs to be refactored into something reusable - lots of
         * repetition here.
         */

        // Handle up arrow key when inside the open menu.
        if (event.target.closest('#' + activeMenu) !== null) {
          var theMenu = event.target.closest('#' + activeMenu);

          var currentMenu = _setUpMenu(theMenu);

          var currentIndex;

          // This keeps track of which button/focusable is focused in the open menu
          for (var i = 0; i < currentMenu.all.length; i++) {
            if (event.target == currentMenu.all[i]) {
              currentIndex = i;
            }
          }

          var previousItem = currentMenu.all[currentIndex - 1];

          if (!previousItem && currentMenu.last !== undefined) {
            currentMenu.last.focus();
            return;
          }

          previousItem.focus();
        }

        break;

      case KEYS.escape:
        // If there's an open menu, close it.
        if (activeMenu) {
          closeMenu(activeMenu);
        }

        if (activeToggle && activeToggle !== null) {
          activeToggle.focus();
        }

        /**
         * Resets the state variables so as not to interfere with other
         * Escape key handlers/interactions
         */
        activeMenu = null;
        activeToggle = null;

        break;

      case KEYS.tab:
        // Handle tab key when inside the open menu.
        if (event.target.closest('#' + activeMenu) !== null || undefined) {
          var theMenu = event.target.closest('#' + activeMenu);

          var currentMenu = _setUpMenu(theMenu);

          var currentIndex;

          // This keeps track of which button/focusable is focused in the open menu
          for (var i = 0; i < currentMenu.all.length; i++) {
            if (event.target == currentMenu.all[i]) {
              currentIndex = i;
            }
          }

          // Close the dropdown when the user tabs out of the menu.
          if (document.activeElement == currentMenu.last && !event.shiftKey) {
            closeMenu(activeMenu);

            return;
          }
        }

        break;
    }
  }

  /**
   *
   * @param {HTMLElement} context - An optional DOM element. This only
   * needs to be passed in if a DOM element was passed to the init()
   * function. If so, the element passed in must be the same element
   * that was passed in at initialization so that the event listeners can
   * be properly removed.
   */
  function destroy(context) {
    // Optional element to bind the event listeners to
    if (context === undefined) {
      context = document;
    }
    /**
     * Clean up event listeners
     */
    context.removeEventListener('click', _handleClick, false);
    context.removeEventListener('keydown', _handleKeydown, false);
  }

  /**
   *
   * @param {HTMLElement} context - An optional DOM element that the
   * dropdown can be initialized on. All event listeners will be attached
   * to this element. Usually best to just leave it to default
   * to the document.
   */
  function init(context) {
    // Optional element to bind the event listeners to
    if (context === undefined) {
      context = document;
    }

    // Destroy any currently initialized dropdowns
    destroy(context);

    /**
     * Attach all event listerns to the document
     */
    context.addEventListener('click', _handleClick, false);
    context.addEventListener('keydown', _handleKeydown, false);
  }

  /**
   * Return public APIs
   */
  return {
    open: openMenu,
    close: closeMenu,
    closeAll: closeAll,
    init: init,
    destroy: destroy,
    toggle: toggle
  };
})();

/**
 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

var Modal = (function() {
  'use strict';

  var KEYS = {
    tab: 9,
    escape: 27
  };

  // Selectors
  var TRIGGER_SELECTOR = '[data-modal-trigger]';
  var TRIGGER_ATTR = 'data-modal-trigger';
  var CLOSE_ATTR = 'data-modal-close';
  var CLOSE_SELECTOR = '[data-modal-close]';
  var MODAL_SELECTOR = '.rvt-modal, .modal';

  // Anything that is focus-able
  var ALL_FOCUSABLE_ELS = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="-1"]';

  /**
   * These variables are used to keep track of currently active/open modals.
   * They are available in the root scope of the Modal closure so that
   * all of the Modal's methods have access to them.
   *
   * TODO: This probably isn't the best solutions as it makes most of the
   * Modal methods impure. I would be interested in how we might get rid
   * of the need for these global (to the Modal) variables.
   */
  var activeTrigger;
  var activeModal;

  /**
   * @param {String} id - A unique string used for a modal's id and/or
   * data-modal-trigger attribute.
   */
  function _createModalObject(id) {
    var modal = {};

    modal.trigger =
      document.querySelector('[' + TRIGGER_ATTR + '="' + id + '"]');

    modal.body = document.getElementById(id);

    return modal;
  }

  /**
   * Opens the modal
   * @param {String} id - A unique string used for the modal's id attribute
   * @param {Function} callback - A function that is executed after modal
   * is opened.
   */
  function open(id, callback) {
    /**
     * DEPRECATED: This is to add backwards compatibility for the older API
     * where you needed to pass in the modal Object/HTMLElement. This should
     * be deprecated in the next major version.
     */
    if (typeof id === 'object' && id.nodeType === 1) {
      id = id.getAttribute('id');

      if (!id) {
        throw new Error('Please proved an id attribute for the modal you want to open.');
      }
    }

    var modal = _createModalObject(id);

    if (!modal.body) {
        throw new Error("Could not find a modal with the id of " + id + " to open.");
    }

    activeModal = modal.body;

    activeTrigger = modal.trigger;

    modal.body.setAttribute('aria-hidden', 'false');

    // Sets a class on the body to handle overflow and scroll.
    document.body.classList.add('rvt-modal-open');

    /**
     * Emit a custom 'modalOpen' event and send along the modal's
     * id attribute in the event.detail.name()
     */
    fireCustomEvent(activeModal, 'id', 'modalOpen');

    if (callback && typeof callback === 'function') {
      callback();
    }
  }

  /**
   * Closes the modal
   * @param {String} id - A unique string used for the modal's id attribute
   * @param {Function} callback - A function that is executed after modal is closed.
   */
  function close(id, callback) {
    /**
     * DEPRECATED: This is to add backwards compatibility for the older API
     * where you needed to pass in the modal Object/HTMLElement. This should
     * be deprecated in the next major version.
     */
    if (typeof id === 'object' && id.nodeType === 1) {
      id = id.getAttribute('id');

      if (!id) {
        throw new Error('Please proved an id attribute for the modal you want to close.');
      }
    }

    var modal = _createModalObject(id);

    if (!modal.body) {
      throw new Error('Could not find a modal with the id of ' + id + ' to close.');
    }

    modal.body.setAttribute('aria-hidden', 'true');

    document.body.classList.remove('rvt-modal-open');
    
    /**
     * Emit a custom 'modalClose' event and send along the modal's
     * id attribute in the event.detail.name()
     */
    fireCustomEvent(activeModal, 'id', 'modalClose');

    if (callback && typeof callback === 'function') {
        callback();
    }
  }

  /**
   * Focuses the currently active modal trigger if it exists. This is a
   * Helper function that can be used in the callback of the close() method
   * to move focus back to corresponding trigger if needed.
   * @param {String} id - A unique string that is used for the modal
   * trigger's data-modal-trigger attribute.
   */
  function focusTrigger(id) {
    var trigger =
      document.querySelector('[data-modal-trigger="' + id + '"');

    if (!trigger) {
      throw new Error('Could not find a modal trigger with the id of ' + id);
    }

    activeTrigger = trigger;

    trigger.focus();
  }

  /**
   * Focuses the currently open modal if it exists. Can be used
   * to programmatically focus a modal after opening. For instance, in the
   * callback for Modal.open().
   * @param {String} id - A unique string that used for the modal's id
   * attribute.
   */
  function focusModal(id) {
    var modal =
      document.getElementById(id);

    if (!modal) {
      throw new Error('Could not find a modal with the id of ' + id);
    }

    activeModal = modal;

    modal.focus();
  }

  /**
   * Handles all click interactions for modals.
   * @param {Event} event - The event object.
   */
  function _handleClick(event) {
    /**
     * Stores a boolean in the event object, so we can check to see
     * if we should prevent the event from bubbling up when the user
     * clicks inside of the inner modal element.
     */
    event.target.closest('.rvt-modal__inner, .modal__inner') !== null ?
      event.clickedInModal = true:
      event.clickedInModal = false;

    if (event.clickedInModal) {
      event.stopPropagation();
    }

    /**
     * Stores a reference to the event target if it is any of the following:
     * A  Modal trigger button, a modal close button, or the modal background.
     */
    var matchingSelectors =
      TRIGGER_SELECTOR + ', ' + CLOSE_SELECTOR + ', ' + MODAL_SELECTOR;

    var trigger =
      event.target.closest(matchingSelectors);

    if (!trigger) {
      return;
    }

    // Sets the id based on whatever the matching target was.
    var id = trigger.getAttribute(TRIGGER_ATTR) ||
      (trigger.getAttribute(CLOSE_ATTR) && trigger.getAttribute(CLOSE_ATTR) !== 'close' ?
        trigger.getAttribute(CLOSE_ATTR) : false) ||
        event.target.closest(MODAL_SELECTOR);

    switch (trigger !== null) {
      case trigger.hasAttribute(TRIGGER_ATTR):
        open(id);

        activeModal.focus();

        break;
      case trigger.hasAttribute(CLOSE_ATTR):
        event.preventDefault();

        close(id);
        
        // Check to make sure modal was opened via a trigger element.
        if (activeTrigger !== null) activeTrigger.focus();

        break;
      case trigger === id && !event.clickedInModal:
        // If the modal is a dialog bail
        if (trigger.hasAttribute('data-modal-dialog')) return;

        close(id);

        activeTrigger.focus();

        break;
      default:
        return;
    }
  }

  /**
   * A helper function that handles focus trapping for forward (default)
   * tab key press.
   * @param {HTMLElement} first - first focus-able HTMLElement in an array
   * of all focus-able elements.
   * @param {HTMLElement} last - last focus-able HTMLElement in an array
   * of focus-able elements
   * @param {Event} event - The event object
   */
  function _handBackwardTab(first, last, event) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  }

  /**
   * A helper function that handles focus trapping for backward (with the
   * shift key) tab key press.
   * @param {HTMLElement} first - first focus-able HTMLElement in an array
   * of all focus-able elements.
   * @param {HTMLElement} last - last focus-able HTMLElement in an array
   * of focus-able elements
   * @param {Event} event - The event object
   */
  function _handleForwardTab(first, last, event) {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * Handles all keyboard interaction required for the modal.
   * @param {Event} event - The event object
   */
  function _handleKeydown(event) {
    // Do not continue if key stroke is anything other than Escape or Tab
    var currentModal = event.target.closest(MODAL_SELECTOR);

    if (!currentModal) return;

    switch (event.keyCode) {
      case KEYS.tab:

        /**
         * Get all focus-able elements in the modal and convert the
         * resulting nodeList to an Array.
         */
        var focusables =
          Array
            .prototype
            .slice
            .call(currentModal.querySelectorAll(ALL_FOCUSABLE_ELS));

        var firstFocusable = focusables[0];

        var lastFocusable = focusables[focusables.length - 1];

        event.shiftKey ?
          _handBackwardTab(firstFocusable, lastFocusable, event) :
          _handleForwardTab(firstFocusable, lastFocusable, event);

        break;
      case KEYS.escape:
        // If it's a modal dialog, bail
        if (activeModal.hasAttribute('data-modal-dialog')) return;

        close(activeModal.id);

        if (activeTrigger !== null) activeTrigger.focus();

        break;
      default:
        break;
    }
  }

  /**
   * Destroys any initialized Modals
   * @param {HTMLElement} context - An optional DOM element. This only
   * needs to be passed in if a DOM element was passed to the init()
   * function. If so, the element passed in must be the same element
   * that was passed in at initialization so that the event listeners can
   * be properly removed.
   */
  function destroy(context) {
    // Optional element to bind the event listeners to
    if (context === undefined) {
      context = document;
    }

    // Cleans up event listeners
    context.removeEventListener('click', _handleClick, false);
    context.removeEventListener('keydown', _handleKeydown, false);
  }

  /**
   * Initializes the modal plugin
   * @param {HTMLElement} context - An DOM element initialize the modal
   * on. Although it is possible to only initialize the modal on a specific
   * element for instance, <div id="my-div">Modals only work here</div>,
   * We recommend initializing the modal without passing the context argument
   * and letting all event listeners get attached to the document instead.
   */
  function init(context) {
    // Optional element to bind the event listeners to
    if (context === undefined) {
      context = document;
    }

    // Destroy any initialized modals
    destroy(context);

    // Set up event listeners
    context.addEventListener('click', _handleClick, false);
    context.addEventListener('keydown', _handleKeydown, false);
  }

  // Returns public APIs
  return {
    init: init,
    destroy: destroy,
    open: open,
    close: close,
    focusTrigger: focusTrigger,
    focusModal: focusModal
  }
})();
/**
 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

var Tabs = (function() {
  // Documentation base URL:
  var docsBaseUrl = 'https://rivet.uits.iu.edu';

  // component URL
  var componentUrl =
    docsBaseUrl + '/components/page-content/tabs/#javascript-api';

  // Keycodes for easy reference
  var KEYS = {
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
  };

  /**
   * DEPRECATED: "Aria-controls" will be removed for next major 
   * release. Have added CSS selector to provide specific context
   * for aria-controls selection.
   */
  var LEGACY_SELECTORS = '[data-tab], .rvt-tabs__tab[aria-controls]';

  /**
   * @param {nodes} nodeList - Accepts a nodeList and returns an array.
   */
  function nodeListToArray(nodes) {
    return Array.prototype.slice.call(nodes);
  }

  /**
   *
   * @param {HTMLButtonElement} item
   */
  function handleTabActivate(item) {
    item.setAttribute('aria-selected', 'true');
    item.removeAttribute('tabindex');
  }

  /**
   *
   * @param {HTMLButtonElement} item
   */
  function handleTabDeactivate(item) {
    item.setAttribute('aria-selected', 'false');
    item.setAttribute('tabindex', '-1');
  }

  /**
   *
   * @param {String} id
   */
  function activateTab(id, callback) {
    /**
     * NOTE: Adding "aria-controls" to this list for backwards
     * compatibility. Should eventually deprecate the use of or
     * "aria-controls" in favor of the data attributes added here.
     */
    var activeTabSelector =
      '[data-tab="' + id + '"], [aria-controls="' + id + '"]';

    var activeTab =
      document.querySelector(activeTabSelector);

    if (!activeTab) {
      /**
       * In recent rewrites of the some of the other JS components I've
       * been throwing Error Objects for things like missing parameters.
       * Wondering if it might makes sense to just provide a console
       * warning with links to the docs for these API methods?
       */
      console.warn(
        'There were no tabs found with the id of ' + id + '.' + '\n' +
        'Please see the Rivet Tabs JavaScript API documentation for more info: ' + '\n'
        + componentUrl
      );

      return;
    }

    var tabSet =
      activeTab.parentNode.querySelectorAll(LEGACY_SELECTORS);

    var tabs = nodeListToArray(tabSet);

    /**
     * Creates a new array of the tab panels. The array index of each
     * panel corresponds to the index of each tab (button).
     */
    var tabPanels = tabs.map(function (item) {
      /**
       * NOTE: should think about removing the aria-controls selector in
       * future versions in favor of the standard data attributes
       * we are for JS hooks throughout Rivet.
       */
      var id =
        item.getAttribute('data-tab') ||
        item.getAttribute('aria-controls');

      return document.getElementById(id);
    });

    tabs.forEach(function(item) {
      item === activeTab ?
        handleTabActivate(item) :
        handleTabDeactivate(item);
    });

    tabPanels.forEach(function(item) {
      var tabId =
        activeTab.getAttribute('data-tab') ||
        activeTab.getAttribute('aria-controls');

      item.id === tabId ?
        item.removeAttribute('hidden') :
        item.setAttribute('hidden', 'hidden');
    });

    /**
     * NOTE: For backward compatibility, we're excepting either the
     * 'data-tab' or 'aria-controls' attributes.
     */
    var eventAttribute =
      activeTab.hasAttribute('data-tab') ? 'data-tab' : 'aria-controls';

    // Fire the custom 'tabActivated' event
    fireCustomEvent(activeTab, eventAttribute, 'tabActivated');

    // Execute callback if it exists
    if (callback && typeof callback === 'function') {
      callback();
    }
  }

  function _handleClick(event) {
    // NOTE: Backwards compatibility for 'aria-controls' here.
    var activeTab = event.target.closest(LEGACY_SELECTORS);

    if (!activeTab) return;

    var id =
      activeTab.getAttribute('data-tab') ||
      activeTab.getAttribute('aria-controls');

    activateTab(id);
  }

  function _handleKeydown(event) {
    // Handle keydown events here
    var activeTab  = event.target.closest(LEGACY_SELECTORS);

    if (!activeTab) return;

    // Create a nodeList of all the buttons in the tab set
    var tabSet =
      activeTab.parentNode.querySelectorAll(LEGACY_SELECTORS);

    /**
     * Convert nodeList to an array so we can find the first, last, etc.
     * element and use Array methods on it.
     */
    var tabs = nodeListToArray(tabSet);

    var nextTab = tabs.indexOf(activeTab) + 1;

    var prevTab = tabs.indexOf(activeTab) - 1;

    switch (event.keyCode) {
      case KEYS.right || KEYS.down:
        !tabs[nextTab] ?
          tabs[0].focus() :
          tabs[nextTab].focus();

        break;
      case KEYS.down:
        !tabs[nextTab] ?
          tabs[0].focus() :
          tabs[nextTab].focus();

        break;
      case KEYS.left:
        !tabs[prevTab] ?
          tabs[tabs.length - 1].focus() :
          tabs[prevTab].focus();

        break;
      case KEYS.up:
        !tabs[prevTab] ?
        tabs[tabs.length - 1].focus() :
        tabs[prevTab].focus();

        break;
      case KEYS.end:
        tabs[tabs.length - 1].focus();

        break;
      case KEYS.home:
        tabs[0].focus();

        break;
      default:
        return;
    }
  }

  /**
   * @param {HTMLElement} context
   */
  function destroy(context) {
    if (context === undefined) {
      context = document;
    }

    context.removeEventListener('click', _handleClick, false);
    context.removeEventListener('keydown', _handleKeydown, false);
  }

  /**
   * @param {HTMLElement} context
   */
  function init(context) {
    if (context === undefined) {
      context = document;
    }

    // Destroy any currently initialized tabs
    destroy(context);

    context.addEventListener('click', _handleClick, false);
    context.addEventListener('keydown', _handleKeydown, false);
  }

  return {
    init: init,
    destroy: destroy,
    activateTab: activateTab
  };
})();
/**
 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

var FileInput = (function() {
  'use strict';

  /**
   * Sets up some text we'll need to reuse throughout.
   */
  var DEFAULT_TEXT = 'No file selected';
  var UPLOAD_ATTR = 'data-upload';

  /*!
   * Sanitize and encode all HTML in a user-submitted string
   * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {String} str  The user-submitted string
   * @return {String} str  The sanitized string
   */
  function sanitizeHTML(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  /**
   *
   * @param {HTMLInputElement} input - HTML file input
   * @return {HTMLSpanElement} - A span containing the a description
   * of the number of files attached to file input
   */
  function _buildMultipleFiles(input) {
    var fileCount = document.createElement('span');
    fileCount.textContent = input.files.length + ' files selected';
    return fileCount;
  }

  /**
   *
   * @param {HTMLInputElement} input - HTML file input
   * @return {HTMLSpanElement} - A span containing the file name that was
   * attached to the file input
   */
  function _buildSingleFile(input) {
    // Create <span> element to display our file name
    var singleFileItem = document.createElement('span');

    /**
     * Sanitize use input here just incase someone would make the
     * name of their file a malicious script.
     */
    var singleFileName = sanitizeHTML(input.files[0].name);

    // Add the file name as the text content
    singleFileItem.textContent = singleFileName;

    // Returns our built <span> element.
    return singleFileItem;
  }

  /**
   *
   * @param {Event} event - Handles the main 'change' event emitted when
   * file(s) are attached to the file input
   */
  function _handleChange(event) {
    // Store a reference to the file input wrapper (data-upload) element
    var uploadElement = event.target.closest('[' + UPLOAD_ATTR + ']');

    // If the change event was on the file input, bail.
    if (!uploadElement) return;

    // The unique id of the file input, wrapper, and preview elements
    var uploadId = uploadElement.getAttribute(UPLOAD_ATTR);

    // The actual input element
    var uploadInput = document.getElementById(uploadId);

    // The preview element where we'll inject file count, etc.
    var uploadPreview = uploadElement.querySelector('[data-file-preview]');

    // Check to make sure that at least one file was attached
    if (uploadInput.files.length > 0) {
      // Set remove the preview element placeholder text
      uploadPreview.innerHTML = '';

      /**
       * If there is more than one file attached, build up a span
       * that shows the file count to insert into the preview element,
       * otherwise show the file name that was uploaded.
       */
      uploadInput.files.length > 1 ?
        uploadPreview.appendChild(_buildMultipleFiles(uploadInput)) :
        uploadPreview.appendChild(_buildSingleFile(uploadInput));

      // Fire a custom event as a hook for other scripts
      fireCustomEvent(uploadElement, UPLOAD_ATTR, 'fileAttached');
    } else {
      /**
       * If no files were attached set the placeholder text back
       * to the default
       */
      uploadPreview.innerHTML = DEFAULT_TEXT;
    }
  }

  /**
   * @param {HTMLElement} context - An optional DOM element. This only
   * needs to be passed in if a DOM element was passed to the init()
   * function. If so, the element passed in must be the same element
   * that was passed in at initialization so that the event listeners can
   * be properly removed.
   */
  function destroy(context) {
    if (context === undefined) {
      context = document;
    }

    context.removeEventListener('change', _handleChange, false);
  }

  /**
   * @param {HTMLElement} context - An optional DOM element that the
   * file input can be initialized on. All event listeners will be attached
   * to this element. Usually best to just leave it to default
   * to the document.
   */
  function init(context) {
    if (context === undefined) {
      context = document;
    }

    // Destroy any currently initialized file inputs
    destroy(context);

    context.addEventListener('change', _handleChange, false);
  }

  // Expose public API here
  return {
    init: init,
    destroy: destroy
  };
})();

/**
 * Copyright (C) 2018 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable */
(function() {
  /**
   * Kick off all components
   */
  Alert.init();
  Drawer.init();
  Dropdown.init();
  Modal.init();
  Tabs.init();
  FileInput.init();
})();
/* eslint-enable */
