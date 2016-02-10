<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class FeedbackType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('topic')
            ->add('route')
            ->add('content')
            ->add('created')
            ->add('updated')
            ->add('deletedAt')
            ->add('createdBy')
            ->add('updatedBy')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\Feedback',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'appbundle_feedback';
    }
}
