<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class CitationType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title')
            ->add('description')
            ->add('full_text',
                        'textarea',
                        array(
                            'attr' => array(
                                        'cols' => '90',
                                        'rows' => '5',
                                        ),
                        )
                    )
            ->add('is_secondary')
            ->add('publication')
            ->add('publication_volume')
            ->add('publication_issue')
            ->add('publication_pages')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\Citation',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'appbundle_citation';
    }
}
