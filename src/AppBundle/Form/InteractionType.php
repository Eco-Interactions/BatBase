<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class InteractionType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('citation')
            ->add('is_likely', 'checkbox')
            ->add('is_old_world', 'checkbox')
            ->add('interaction_type')
            ->add('tags')
            ->add('location')
            ->add('subject')
            ->add('object')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\Interaction',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'appbundle_interaction';
    }
}
