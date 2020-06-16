<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Deletes fake users created before captcha was added to registration page and 
 * the example lists that were created for those accounts.
 * Note: The 'created/updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20200614FakeUsers extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('AppBundle:'.$className)
            ->findOneBy([$prop => $val]);
    }

    public function getEntities($className)
    {
        return $this->em->getRepository('AppBundle:'.$className)->findAll();
    }

    public function persistEntity($entity, $creating = false)
    {
        if ($creating) {
            $entity->setCreatedBy($this->admin);
        }
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }
/* ========================== up ============================================ */

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6);

        $this->removeFakeUsers($this->getEntities('User'));

        $this->em->flush();
    }
    private function removeFakeUsers($users)
    {
        foreach ($users as $user) {
            if ($user->getLastActivityAt()) { continue; }
            if ($user->isEnabled()) { continue; }                               
            if ($this->isWhitelisted($user->getUserName())) { continue; }       
            if ($this->isFlaggedForRemoval($user->getUserName())) {
                $this->removeFakeUser($user);
                continue;
            }                                                                   print("'".$user->getUserName()."', ");
        }
    }
    private function isWhiteListed($username)
    {
        $real = [ 'mgaletti', 'rubenbarquez', 'christiancabrera', 'camilocalderon',
            'laurel.symes', 'MedL', 'omurillo', 'oscarem17', 'jan.bechler', 
            'mariafouks', 'fadidahoud', 'alebc', 'lmsims', 'ketal-23', 'Fla'];
        return in_array($username, $real);
    }
    private function removeFakeUser($user)
    {
        $this->deleteUserLists($user);
        $this->em->remove($user);
    }
    private function deleteUserLists($user)
    {
        $lists = $this->em->getRepository('AppBundle:UserNamed')
            ->findBy(['createdBy' => $user]);

        foreach ($lists as $list) {
            $this->em->remove($list);
        }
        $this->em->flush();
    }
    private function isFlaggedForRemoval($username)
    {
        $remove = ['dlozscbEIBAV', 'zawyrtmkKGA', 'aGiMQTYlunLCjEAJ', 'JSFjMGPeRIqf', 
        'ftALlnGpgrbOy', 'miWazSMrqKNu', 'dKITvOAEWkji', 'lmRzhjNW', 'vOSCIjVbHEygRGkm', 
        'LUGpdXQaTqerlCBE', 'OCukPDWYaHxEyX', 'sJZqjMpPeLATNduh', 'UlydFjIQuTkJPD', 
        'OjzsEMXYyTNvWtu', 'PHcgXUNLoq', 'nbHqeSaxg', 'HONaeKEjcYgbVG', 'zblOiUpF', 
        'pqmljcrDvMnIa', 'itEfLmQVSUyhnD', 'zMeDWxGNtcRopfa', 'scGPYyHxBbVi', 
        'EZqUObyIgFknARv', 'yevqbcXHNLRF', 'dSCzLrUoDxe', 'bnhHIskJNOYeKgE', 
        'AJtsLqDM', 'baRohFAPQJuYegKz', 'oJRuYtBjPXsK', 'HmjhfiGMIgUO', 'KozGWAIwfB', 
        'TtJzrhRBKjXlCA', 'xaMUEBTzi', 'fFJYNtLVbdlcB', 'eaxOzAQmcltTpJ', 'FfyPoUKeHJQW', 
        'wlthvUKq', 'FVOzvPtBog', 'ouIsbQOLtpjzMFnq', 'SgMlQUHpixA', 'AOytjoJfRrTHMQNB', 
        'dyOlbJzxNcUB', 'fCEboQXFVw', 'kcoqUNCMivYJaj', 'LBgaliKmudp', 'UYnkKdXLyIqMjDb', 
        'PUAunhmOVkiQ', 'wERvLSbpJQjtVUd', 'JpvRwqoemdMGBhP', 'XlSvZpGigtzAnOH', 
        'DlkziVCQEIN', 'JDvNQTaAzH', 'npPGkgzR', 'DzGmXwROdTPj', 'YlTzSNUeA', 
        'OMpRsfaXFVABJdx', 'NEvmPuFHGtJQx', 'WweIKCLQGhFYmE', 'kaiQrCemXJNK', 
        'kJPdshcRAbMOIzpW', 'oWgEykYsrXOTDeA', 'CXYlbZEjKVTmudx', 'KDAUJBkYbLVmlE', 
        'hVPfgkMlnvKyWmB', 'lMfqHITawoF', 'VULwWgacdzo', 'OqArGZReBC', 'AUTGDYwpuaHBL', 
        'iwGPETofyRhlQZ', 'bZnEYCJjSTQIwR', 'RfZOkDxM', 'pSfziXmtIr', 'JVUqascr', 
        'gZvIltLrwAzaFOU', 'mRIPEycdYvTeFBu', 'nIxZtJsVflv', 'sUTOHKVeIhkECaS', 
        'piKHbeCWwOvhJ', 'LcKGqQIPkF', 'NTcoBkgGs', 'WMPSwvfRpey', 'ROnPjACbVpwBEx', 
        'nzTDUYlAGFXBw', 'kEApPoBny', 'bwZJLiskm', 'oBgGvaZIeSQqJXL', 'tFpAxEeb', 
        'BEYpUfKJoR', 'qnzpiMfQmZha', 'COpFPGjHBDt', 'wkhxJCZfRscvo', 'ajZgAqUeLmvNw', 
        'scCEZPJGrVKS', 'gsPqomMXezOaQvBr', 'FWThUJcIiumqL', 'PbRpcnwWqG', 'nOVFtusdXy', 
        'cEImeXhOTAj', 'oumCsFQRkqVWNXG', 'zKkZdAyEOSfqJ', 'jAhJFYvriXPm', 'WbQVnHkFfj', 
        'QJTtIUjC', 'ovyYpQdF', 'VGwfaOZy', 'IFdEenqxlKy', 'DkYcSBObpV', 'KSBzCLqmyfDOrRWJ', 
        'OmIVldyg', 'nDLNsHoWdGctOgI', 'mNEyerOUDuFAZBtq', 'BPrsaMcZQG', 'FSrcwsBtyUqdz', 
        'RJAqxYaEM', 'TrIFLVwSxXkdD', 'wIyUQBEcpRkGiH', 'zyQrdBSGnhgF', 'CrYiuOyHMxFhKzl', 
        'OepWfzKUq', 'AWFGkixuSKsOt', 'NDeTMIRSWgaGL', 'bjMKdBlU', 'TWwhHMeg', 
        'qYatlXAhbDuIWSsO', 'OaesPxdNbBkK', 'EflgHLMWDaRIBq', 'bQoSRwXB', 'aCDoNcXnfVIxFAu', 
        'UKOsZhxtjVSI', 'cGgPKfsRhVXHibj', 'TRYQUPpkSoslKe', 'sbLZQpiC', 'fpjLyoVUemuSGd', 
        'uHULsyCQGe', 'OVZjPNTGzUwXYv', 'TXPZMEVHaBQAmn', 'vnojAsHWwaLbUQiD', 'fZWqSeQxp', 
        'gYIbhsfF', 'bRzXfnPTQ', 'vuQZIpMBykdwmaeL', 'nPTeFRxztgfKC', 'jLVpRCcNoIqyv', 
        'JfxjeUPu', 'xIvhuNjPzgpAXU', 'BJaIAVSYL', 'RTJdyLhVbwuWjEc', 'OMPplGUwQmFh', 
        'zVPTpRtZerKh', 'NSjDGHRL', 'pZvItbAHe', 'EQIhnPopG', 'TbOjFXyg', 'xorVfUzFaBb', 
        'xMEYuDRzbr', 'DzITUPSx', 'CtawHzSOXDQFpd', 'MbwmpariNO', 'zdogUaLMslNkWOm', 
        'DysqlQAB', 'AMiqUnebDRQHrK', 'hmwIrKEBcnb', 'zNStVxGBQXJyI', 'YzkAMdaWlSTKbLNI', 
        'wyAfRvxW', 'VbSjcKJpXr', 'kzKBbJqL', 'CoGkwARelIg', 'EkOUaTHDGlVq', 'GUyrWfsoCjZ', 
        'leKifwcvPSEt', 'TRhMAxvnS', 'lbpzOYEqfXmNMc', 'AZSxmoQzT', 'PvCmUMwj', 'mHqsNWgOGd', 
        'DLXxdeuRSEy', 'pVLjHENkMFUStlx', 'trmXQESNaqjFsDU', 'WborJPLdBxH', 'vWCDaxhyNYRMT', 
        'PxgAwbzuhmciDUol', 'kutAYTeESLBW', 'czFYVDymrUTvQZgN', 'drPmRwXxvMz', 'OuamAqGVYtso', 
        'hBxGSVgubflW', 'AykBSKPVRrpHjF', 'BTolNCKxwVjsz', 'tkFYwAhf', 'NaPjAWxkRF', 
        'raFkdyYXJPuTclnO', 'spSfOwgh', 'nFYkvbGup', 'VQbNtgvGuoT', 'REwnjplyJms', 
        'wIbXZaJkmHVUvh', 'YSkaNqhIzJot', 'YLyRKvOz', 'scJGMuvP', 'iJSTONcjdYtr', 
        'ZbUlMckKLJyhiqNm', 'DKhyFHWqjgAMYlIE', 'bjwiQkYRExoVcvm', 'CtBqbEkRDdNPMaV', 
        'npufgiYVAdNWot', 'PHnBlcGCKiuosRtm', 'YZRjpIVFStcz', 'tCTZWFKrkHAuqfDE', 
        'xBMIultRWGq', 'qQfdsACcrRz', 'OCnqLBVz', 'mtYSTdwMFryoj', 'clBufaHIFL', 'fjGexIXl', 
        'buiWZQBsCE', 'PlZdMnYUA', 'tTuMXvIla', 'uqiVbUPBMDJjNv', 'lTvLntBRVbc', 
        'xKFeUEtpolqmSh', 'DzjkuWEBgAVHGc', 'ckiGVRrtOmwxPy', 'bmLicEreCIDuVs', 'loyNsFztxg', 
        'DWXEbdBOQunrMPa', 'pEwUvSDay', 'aHbzVTNMjXrec', 'SpVnhaKOogv', 'tDIiEjRazVMqPKBe', 
        'TfvtBqVC', 'CyJagvMoNz', 'NZSpYuRyonOA', 'hQFYSCGMBvs', 'KzSRyEAjFWmPw', 'WTPFiCOq', 
        'AeLWYjXCGu', 'eNhgMHuxPjwzIRG', 'VnPzUlekxFchJ', 'EsGrkvPDA', 'oYgpWVskrcuxPtN', 
        'oLJYSpWIVTl', 'KxyACdXLMijcQ', 'alomwqgpEneNvYWB', 'mzHBjKXxSNTleEV', 'GpYyaPCSQDFWz', 
        'HMnsqmNuPFY', 'fPtkhUubJE', 'cKiklxortO', 'yGEfLFpnOeVKTA', 'cmXdPkMsxpQLeRCf', 
        'qNylrAQpabXzv', 'DrLnMxRFSiwUtZ', 'wLvypiPuBIhOcE', 'nQBfuAopXk', 'TSVxGgnMeiCIPa', 
        'mdzROMJIpNwLX', 'jlgycOEDntZMpIoB', 'tCgHKkSpE', 'OAwsFNVSWDBR', 'WPkUQSpJgz', 
        'HruFiqAyP', 'GlPFrkRcQfSdg', 'dFzQmnEDLaBUI', 'IqhQkgAny', 'CUOYVFjx', 'VJZxPWdGtwrfRml', 
        'cVmeSdfOQHlzy', 'jPxOLraEHbBv', 'hTqMRAYJm', 'lpCrSbDwZkPeXBJI', 'vtTxZbDwR', 
        'SuyqYLMxZfeHPaNQ', 'WFJMDTPfhpj', 'gBdEhlZMSTD', 'MghUxfzdeFRiW', 'umVXdetjZAP', 
        'ydDlrZeRUwctFu', 'twqXngmWdk', 'brlvsuFgSwnx', 'gqNtAHdWcIseEvik', 'NUotlgmLDQHzB', 
        'POYcKHBv', 'QDKzIeSCR', 'vxcPKRfQAEXLr', 'lyqZfaSMXeiWzA', 'oRAPDFEJBnCNk', 
        'QiaXZblzRKedN', 'gsWDdvVFMamKZf', 'foLHicxDrM', 'pBTNmXReLWOC', 'rIGBJDENehcskngA', 
        'uJLEdPhUANl', 'nsxAZHIEot', 'kQNitzKsqu', 'uISxblDWRT', 'SmUlbhXfJMIj', 
        'XYMwuAiZyTvaVhO', 'CjEDMXFRoe', 'rSKPwfoLkD', 'UOXjRPaEWmIpLonZ', 'DXeTkCGxN', 
        'OXiDVnsbR', 'jfHtRpsPUZlcx', 'NmsaKGBR', 'DyRpnIqWKTxoaGuB', 'lGIOrMbuKSQCA', 
        'lQvmHrsT', 'OLRQjKtHWbuYy', 'wTJvHinAmfCQkuZ', 'jhAatgPze', 'ricfkTLhlKq', 
        'xKJqXSzdAHV', 'QkKIMhjmgnObVBPD', 'wGSCZQoFfjyqrm', 'XtjhwKViMAF', 'rFOJAakSMsfVw', 
        'HBYMdXOr', 'FAcNLlYispqEnzVH', 'nOPlXsTVHrIveQ', 'gYpHVLOTKiDBqs', 'odUjNePhfYwZQM', 
        'jkWLurvYVGX', 'IfSaYPHAZDJEQx', 'xWpEKfHPuhzsknSX', 'LuevrBXcw', 'adSfjPKcO', 
        'YagqsGucBWTQ', 'GOjmRtoqX', 'SZmvtGpiOqujVhK', 'MGpXINtyuVEShO', 'CAykNRTzcaZbH', 
        'ACMJimxl', 'rlESaKmIQXY', 'bLUVZBShJqTPFpD', 'lbXLUhBpeMkD'];
        return in_array($username, $remove);
    }
/* ======================== down ============================================ */
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
