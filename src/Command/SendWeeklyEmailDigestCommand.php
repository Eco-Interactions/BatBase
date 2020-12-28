<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Psr\Log\LoggerInterface as Logger;

use App\Service\WeeklyDigestManager as DigestManager;

class SendWeeklyEmailDigestCommand extends Command
{
    // the name of the command (the part after "bin/console")
    protected static $defaultName = 'app:send-weekly-digest';
    private $digest;
    private $em;
    private $logger;
/* ____________________ CONSTRUCT/CONFIGURE COMMAND _________________________ */
    public function __construct(Logger $logger, DigestManager $digest)
    {
        $this->logger = $logger;
        $this->digest = $digest;
        // best practices recommend to call the parent constructor first and
        // then set your own properties. That wouldn't work in this case
        // because configure() needs the properties set in this constructor
        parent::__construct();
    }
    /**
     * The configure() method is called automatically at the end of the command
     * constructor. If your command defines its own constructor, set the properties
     * first and then call to the parent constructor, to make those properties
     * available in the configure() method
     */
    protected function configure()
    {
    }
/* ____________________ EXECUTE COMMAND _____________________________________ */
    /** this method must return the "exit status code". 0: success, 1: error */
    protected function execute(InputInterface $input, OutputInterface $output)
    {

        $output->writeln(['Creating Weekly Digest', '======================','']);
        try {
            $data = $this->digest->sendAdminWeeklyDigestEmail();
            $output->writeln(['SENT']);
            foreach ($data as $key => $value) {
                $output->writeln([$key, print_r($value, true)]);
            }
            return 0;
        } catch (Exception $e) {
            $output->writeln(['SEND ERROR', $e->getMessage()]);
            $this->logger->error("\n\n### Error @ [$e->getLine()] = $e->getMessage()\n");
            return 1;
        }
    }
/* ________________________ CONSOLE OUTPUT __________________________________ */
    // // outputs multiple lines to the console (adding "\n" at the end of each line)
    // $output->writeln([
    //     'User Creator',
    //     '============',
    //     '',
    // ]);

    // // the value returned by someMethod() can be an iterator (https://secure.php.net/iterator)
    // // that generates and returns the messages with the 'yield' PHP keyword
    // $output->writeln($this->someMethod());

    // // outputs a message followed by a "\n"
    // $output->writeln('Whoa!');

    // // outputs a message without adding a "\n" at the end of the line
    // $output->write('You are about to ');
    // $output->write('create a user.');
}