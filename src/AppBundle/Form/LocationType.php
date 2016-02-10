<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class LocationType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('description')
            ->add('country')
            ->add('habitat_type')
            ->add('regions')
            ->add('elevation')
            ->add('elev_unit_abbrv', 'text', array('data' => 'm'))
            ->add('gps_data')
            ->add('latitude')
            ->add('longitude')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\Location',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'appbundle_location';
    }
}
