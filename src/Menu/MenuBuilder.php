<?php
namespace App\Menu;

use Knp\Menu\FactoryInterface;
// use Symfony\Component\DependencyInjection\ContainerAwareInterface;
// use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class MenuBuilder
{
    private $factory;

    /**
     * @param FactoryInterface $factory
     *
     * Add any other dependency you need
     */
    public function __construct(FactoryInterface $factory)
    {
        $this->factory = $factory;
    }
    // use ContainerAwareTrait;

    public function createMainMenu(array $options)
    {
        $user_name = $options['usrname'];
        $menu = $this->factory->createItem('root');
        $menu->setChildrenAttributes(array('id' => 'oimenu'));
        $menu->addChild('Home', array('route' => 'app_home'));
        $menu->addChild('About', array('uri' => '#'));
        $menu['About']->setAttribute('class', 'closed smtrigger');
        $menu['About']->addChild('Project', array('route' => 'app_about'));
        $menu['About']->addChild('Database', array('route' => 'app_db_top'));
        $menu['About']->addChild('Definitions', array('route' => 'app_definitions'));
        $menu['About']->addChild('Bibliography', array('route' => 'app_biblio'));
        $menu['About']->addChild('Coming Soon', array('route' => 'app_future_dev'));
        $menu->addChild('Database', array('route' => 'app_search_show'));
        if ($this->_isLoggedInUser($options['usrrole'])) {
            $menu->addChild($user_name, array('uri' => '#'));
            $menu[$user_name]->setAttribute('class', 'closed smtrigger');
            $menu[$user_name]->addChild('Submit Publication', array('route' => 'app_submit_pub'));
            if ($this->_isAdmin($options['usrrole'])) {
                $menu[$user_name]->addChild('View Submissions', array('route' => 'app_file_upload_list'));
                $menu[$user_name]['View Submissions']->setAttribute('class', 'admin-menu');
                $menu[$user_name]->addChild('View Feedback', array('route' => 'app_feedback'));
                $menu[$user_name]['View Feedback']->setAttribute('class', 'admin-menu');
            }
            if ($this->_isSuper($options['usrrole'])) {
                $menu[$user_name]->addChild('Online Users', array('route' => 'admin_user_online'));
                $menu[$user_name]->addChild('Content Blocks', array('route' => 'admin_content_block'));
                $menu[$user_name]['Online Users']->setAttribute('class', 'super-admin-menu');
                $menu[$user_name]['Content Blocks']->setAttribute('class', 'super-admin-menu');
            }
            $menu[$user_name]->addChild('View Profile', array('route' => 'fos_user_profile_show'));
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
