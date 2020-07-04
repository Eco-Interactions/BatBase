<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

(new Dotenv(false))->loadEnv(dirname(__DIR__).'/.env.test.local');

$_SERVER += $_ENV;
$_SERVER['APP_ENV'] = 'test';
$_SERVER['APP_DEBUG'] = '1';
