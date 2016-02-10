<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class TaxonType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('default_guid')
            ->add('display_name')
            ->add('is_old_world')
            ->add('link_display')
            ->add('link_url')
            ->add('level')
            ->add('parent_taxon')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\Taxon',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'appbundle_taxon';
    }
}
