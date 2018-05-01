<?php

// src/AppBundle/Menu/Builder.php
namespace AppBundle\Menu;

use Knp\Menu\FactoryInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class Builder implements ContainerAwareInterface
{
    use ContainerAwareTrait;
    
    public function mainMenu(FactoryInterface $factory, array $options)
    {
		$user_name = $options['usrname'];
        $menu = $factory->createItem('root');
        $menu->setChildrenAttributes(array('id' => 'oimenu'));
		$menu->addChild('Home', array('route' => 'app_home'));
		$menu->addChild('About', array('uri' => '#'));
        $menu['About']->setAttribute('class', 'smtrigger arrow');
        $menu['About']->addChild('Project', array('route' => 'app_about'));
		$menu['About']->addChild('Database', array('route' => 'app_db_top'));  //Citations
		$menu['About']->addChild('Definitions', array('route' => 'app_definitions'));
		$menu['About']->addChild('Coming Soon', array('route' => 'app_future_dev'));
		$menu->addChild('Database', array('route' => 'app_search_show'));
		if ($this->_isLoggedInUser($options['usrrole'])) {
			$menu->addChild($user_name, array('uri' => '#'));
			$menu[$user_name]->setAttribute('class', 'smtrigger arrow');
			if ($this->_isAdmin($options['usrrole'])) {
				$menu[$user_name]->addChild('View Feedback', array('route' => 'app_feedback'));
			}
			$menu[$user_name]->addChild('Change Password', array('route' => 'fos_user_change_password'));
			$menu[$user_name]->addChild('Log Out', array('route' => 'fos_user_security_logout'));
		} else {
			$menu->addChild('Login', array('route' => 'fos_user_security_login'));
			$menu->addChild('Participate', array('route' => 'fos_user_registration_register'));
		}
        return $menu;
    }

    private function _isLoggedInUser($user_role) {
		$show_for_roles = array('user', 'editor', 'admin','super');
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
