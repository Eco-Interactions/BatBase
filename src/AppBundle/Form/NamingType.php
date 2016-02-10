<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class NamingType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('from_date')
            ->add('guid')
            ->add('to_date')
            ->add('taxon')
            ->add('taxonym')
            ->add('naming_type')
            ->add('authority')
            ->add('parent_taxon')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\Naming',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'appbundle_naming';
    }
}
