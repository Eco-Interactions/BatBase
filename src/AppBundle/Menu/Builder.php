<?php

// src/AppBundle/Menu/Builder.php
namespace AppBundle\Menu;

use Knp\Menu\FactoryInterface;
use Symfony\Component\DependencyInjection\ContainerAware;

class Builder extends ContainerAware
{
    public function mainMenu(FactoryInterface $factory, array $options)
    {
		$user_name = $options['usrname'];
        $menu = $factory->createItem('root');
        $menu->setChildrenAttributes(array('id' => 'oimenu'));
		$menu->addChild('Home', array('route' => 'app_home'));
        $menu->addChild('About', array('uri' => '#'));
        $menu['About']->setAttribute('class', 'smtrigger arrow');
			$menu['About']->addChild('batplant.org', array('route' => 'app_about'));
			$menu['About']->addChild('Database', array('route' => 'app_db_top'));
			$menu['About']->addChild('Definitions', array('route' => 'app_definitions'));
			$menu['About']->addChild('Team', array('route' => 'app_team'));
//        $menu->addChild('Links', array('route' => 'AppBundle_links'));
//        $menu->addChild('News', array('route' => 'AppBundle_news'));
		if ($this->_isLoggedInUser($options['usrrole'])) {
			if ($this->_isAdmin($options['usrrole'])) {
			$menu->addChild('Database', array('uri' => '#'));
			$menu['Database']->setAttribute('class', 'smtrigger arrow');
				$menu['Database']->addChild('Interaction Types', array('route' => 'app_interaction_type'));
				$menu['Database']->addChild('Citations', array('uri' => '#'));
				$menu['Database']['Citations']->setAttribute('class', 'smtrigger arrow');
					$menu['Database']['Citations']->addChild('All Citations', array('route' => 'app_citation'));
					$menu['Database']['Citations']->addChild('Publications', array('route' => 'app_publication'));
					$menu['Database']['Citations']->addChild('Authors', array('route' => 'app_author'));
				$menu['Database']->addChild('Locations', array('uri' => '#'));
				$menu['Database']['Locations']->setAttribute('class', 'smtrigger arrow');
					$menu['Database']['Locations']->addChild('All Locations', array('route' => 'app_location'));
					$menu['Database']['Locations']->addChild('Countries', array('route' => 'app_country'));
					$menu['Database']['Locations']->addChild('Habitat Types', array('route' => 'app_habitat_type'));
				$menu['Database']->addChild('All Bat Taxa', array(
					'route' => 'app_domain_show',
					'routeParameters' => array('slug' => 'bat')
				));
				$menu['Database']->addChild('All Plant Taxa', array(
					'route' => 'app_domain_show',
					'routeParameters' => array('slug' => 'plant')
				));
				$menu['Database']->addChild('All Arthropod Taxa', array(
					'route' => 'app_domain_show',
					'routeParameters' => array('slug' => 'arthropod')
				));
				$menu['Database']->addChild('All Interactions', array('route' => 'app_interaction'));
			}
			$menu->addChild($user_name, array('uri' => '#'));
			$menu[$user_name]->setAttribute('class', 'smtrigger arrow');
				$menu[$user_name]->addChild('Change Password', array('route' => 'fos_user_change_password'));
				$menu[$user_name]->addChild('Log Out', array('route' => 'fos_user_security_logout'));
				if ($this->_isAdmin($options['usrrole'])) {
					$menu[$user_name]->addChild('View Feedback', array('route' => 'app_feedback'));
					$menu[$user_name]->addChild('Export', array('uri' => '#'));
					$menu[$user_name]['Export']->setAttribute('class', 'smtrigger arrow');
						$menu[$user_name]['Export']->addChild('Authors', array('route' => 'app_author_export'));
						$menu[$user_name]['Export']->addChild('Citations', array('route' => 'app_citation_export'));
						// $menu[$user_name]['Export']->addChild('Interactions', array('route' => 'app_interaction_export'));
					}
		} else {
			$menu->addChild('Login', array('route' => 'fos_user_security_login'));
			$menu->addChild('Register', array('route' => 'fos_user_registration_register'));
		}
        return $menu;
    }

    private function _isLoggedInUser($user_role) {
		$show_for_roles = array('member','admin','super');
		if (in_array($user_role, $show_for_roles)) {
			return true;
		}
		return false;
	}

    private function _isAdmin($user_role) {
		$show_for_roles = array('admin','super');
		if (in_array($user_role, $show_for_roles)) {
			return true;
		}
		return false;
	}

    private function _isSuper($user_role) {
		$show_for_roles = array('super');
		if (in_array($user_role, $show_for_roles)) {
			return true;
		}
		return false;
	}
}
