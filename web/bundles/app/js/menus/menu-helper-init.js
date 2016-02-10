$(function() {
    var menuMngr = ECO_INT_FMWK.menuMngr;

    menuMngr.initMenus = function(selector) {
        var $topUl = $(selector);
        var menuMgr = new ECO_INT_FMWK.menuMngr.menuManager();																			//			logThis(menuMgr, 'init_complete', '');
        initChildHelpers($topUl, 0);

        function initChildHelpers($parentUl, lvl) {
            var childTriggers = getChildTriggers($parentUl);
            childTriggers === 0 || initHelpersRecurse(childTriggers, lvl);
        }

        function initHelpersRecurse(childTriggers, lvl) {
    		childTriggers.each(function () {
    			var menuData = getHelperData($(this), lvl);
    			var childHelper = initHelper(menuData);
    			initChildHelpers(menuData.ul, lvl + 1);
    		});
        }

        function initHelper(menuData) {
            var helper = new menuMngr.menuHelper(menuData);
            menuData.li.on("mouseenter", helper.msIn).on("mouseleave", helper.msOut);
            menuData.li.removeClass('smtrigger');																		//		logThis(helper, 'init_complete', '');
            return helper;
        }

        function getHelperData($li, lvl) {
            return {
                menuName:   $li.find('a:first').text(),
                ul:         $li.find('ul:first'),
                li:			$li,
                mgr:    	menuMgr,
                level: 		lvl
            };
        }

        function getChildTriggers(ulElem) {
            var childTriggers = $(ulElem).children('.smtrigger');
            return childTriggers.length === 0 ? 0 : childTriggers;
        }
    }       /*  End of function def for initHelpers  */
});