<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

class ProfileFormType extends AbstractType
{
    private $class;

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('first_name');
    }

    public function getName()
    {
        return 'appbundle_profile';
    }

    public function getParent()
    {
        return 'fos_user_profile';
    }
}
