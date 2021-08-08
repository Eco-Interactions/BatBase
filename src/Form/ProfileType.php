<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use EWZ\Bundle\RecaptchaBundle\Form\Type\EWZRecaptchaType;
use EWZ\Bundle\RecaptchaBundle\Validator\Constraints\IsTrue as RecaptchaTrue;

class ProfileType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('first_name', TextType::class, ['label' => 'First Name'])
            ->add('last_name', TextType::class, ['label' => 'Last Name'])
            ->add('about_me', TextareaType::class, ['label' => 'About Me'])
            ->add('interest', TextType::class, ['label' => 'Interest Area', 'required' => false])
            ->add('education', TextType::class, ['label' => 'Education Level', 'required' => false])
            ->add('country', TextType::class, ['label' => 'Country', 'required' => false])
            ->add('save', SubmitType::class, ['label' => 'Update'])
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'App\Entity\User',
        ));
    }

    public function getBlockPrefix()
    {
        return 'App_profile';
    }

    public function getParent()
    {
        return 'FOS\UserBundle\Form\Type\ProfileFormType';
    }
}
