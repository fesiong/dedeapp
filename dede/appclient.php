<?php
/**
 * dedecms 百度小程序接口文档
 * 仅支持 php 5.3 以上
 * 版权保护，如需使用，请联系QQ获取授权，并获取百度小程序源码，该接口文件配合百度小程序源码使用。
 * @author 织梦小程序
 * 电话：17097218761
 */
error_reporting(E_ALL & ~E_NOTICE);
if (!class_exists('PDO', false)) {
    showMessage("空间不支持pdo连接");
}
define('VERSION', '0.5.2');
define('BASE_URL', baseUrl());
define('APP_PATH', __DIR__ . '/');
$client = new appClient();
$client->run();

class appClient
{
    private $configPath;
    private $config;

    public function __construct()
    {
        $this->configPath = APP_PATH . 'appclient.config.php';
        if (!file_exists($this->configPath)) {
            //配置不存在，检测并写入配置
            $provider = $this->checkProvider();
            if (!$provider) {
                showMessage("无法判断站点框架，接口无法正常工作。");
            }
            $this->checkConfig($provider);
        }
        $this->config = include($this->configPath);
    }

    public function run()
    {
        $appAction = new appAction($this->config);
        $appAction->handle();
    }

    private function checkProvider()
    {
        $provider = '';
        if (file_exists(APP_PATH . 'index.php')) {
            $content = file_get_contents(APP_PATH . 'index.php');
            if (strpos($content, 'DEDEINC') !== false) {
                $provider = 'dedecms';
            } elseif (strpos($content, 'WordPress') !== false) {
                $provider = 'wordpress';
            } elseif (strpos($content, 'PHPCMS') !== false) {
                $provider = 'phpcms';
            } elseif (strpos($content, 'Zend') !== false) {
                if(file_exists(APP_PATH . 'click_cnt.php')){
                    $provider = 'nitc';
                }
            }
        } else if (file_exists(APP_PATH . 'd/') && file_exists(APP_PATH . 'e/')) {
            $provider = 'empire';
        } else if (file_exists(APP_PATH . 'plus/')) {
            $provider = 'dedecms';
        }

        return $provider;
    }

    private function checkConfig($provider)
    {
        switch ($provider) {
            case 'dedecms':
                $config = $this->checkDedecms();
                break;
            case 'phpcms':
                $config = $this->checkPhpcms();
                break;
            case 'wordpress':
                $config = $this->checkWordpress();
                break;
            case 'empire':
                $config = $this->checkEmpire();
                break;
            case 'nitc':
                $config = $this->checkNitc();
                break;
        }
        $this->writeConfig($config);
    }

    private function checkDedecms()
    {
        $configFile = APP_PATH . "data/common.inc.php";
        if (!file_exists($configFile)) {
            $dir_handle = opendir(APP_PATH);
            while (($file = readdir($dir_handle)) !== false) {
                if (substr($file, 0, 1) !== '.' AND is_dir(APP_PATH . $file)) {
                    $dir_handle2 = opendir(APP_PATH . $file);
                    while (($file2 = readdir($dir_handle2)) !== false) {
                        if ($file2 === 'common.inc.php') {
                            $filePath = APP_PATH . $file . '/' . $file2;
                            $content = file_get_contents($filePath);
                            if (strpos($content, '//数据库连接信息') !== false) {
                                $configFile = $filePath;
                                break 2;
                            }
                        }
                    }
                    closedir($dir_handle2);
                }
            }
            closedir($dir_handle);
        }
        if (!file_exists($configFile)) {
            showMessage("无法获取配置文件，接口无法正常工作");
        }
        $cfg_dbhost = $cfg_dbuser = $cfg_dbpwd = $cfg_dbname = $cfg_db_language = $cfg_dbprefix = '';
        require_once($configFile);
        $hostArr = explode(":", $cfg_dbhost);
        $config = array(
            "provider" => 'dedecms',
            "database" => array(
                'host'     => $hostArr[0],
                'port'     => $hostArr[1] ? $hostArr[1] : '3306',
                'user'     => $cfg_dbuser,
                'password' => $cfg_dbpwd,
                'database' => $cfg_dbname,
                'charset'  => $cfg_db_language,
                'prefix'   => $cfg_dbprefix
            ),
        );

        //写入一些配置
        $provider = new provider($config);
        $provider->initApp();

        return $config;
    }

    private function checkPhpcms()
    {
        $configFile = APP_PATH . "caches/configs/database.php";
        if (!file_exists($configFile)) {
            showMessage("无法获取配置文件，接口无法正常工作");
        }
        $fileConfig = include($configFile);
        $config = array(
            "provider" => 'phpcms',
            "database" => array(
                'host'     => $fileConfig['default']['hostname'],
                'port'     => $fileConfig['default']['port'],
                'user'     => $fileConfig['default']['username'],
                'password' => $fileConfig['default']['password'],
                'database' => $fileConfig['default']['database'],
                'charset'  => $fileConfig['default']['charset'],
                'prefix'   => $fileConfig['default']['tablepre']
            ),
        );

        return $config;
    }

    private function checkWordpress()
    {
        $configFile = APP_PATH . "wp-config.php";
        if (!file_exists($configFile)) {
            showMessage("无法获取配置文件，接口无法正常工作");
        }
        $table_prefix = '';
        require_once($configFile);
        $hostArr = explode(":", DB_HOST);
        $config = array(
            "provider" => 'wordpress',
            "database" => array(
                'host'     => $hostArr[0],
                'port'     => $hostArr[1] ? $hostArr[1] : '3306',
                'user'     => DB_USER,
                'password' => DB_PASSWORD,
                'database' => DB_NAME,
                'charset'  => DB_CHARSET,
                'prefix'   => $table_prefix
            ),
        );

        return $config;
    }

    private function checkEmpire()
    {
        define('InEmpireCMS', true);
        $configFile = APP_PATH . "e/config/config.php";
        if (!file_exists($configFile)) {
            showMessage("无法获取配置文件，接口无法正常工作");
        }
        $ecms_config = array();
        require_once($configFile);
        $config = array(
            "provider" => 'wordpress',
            "database" => array(
                'host'     => $ecms_config['db']['dbserver'],
                'port'     => $ecms_config['db']['dbport'] ? $ecms_config['db']['dbport'] : '3306',
                'user'     => $ecms_config['db']['dbusername'],
                'password' => $ecms_config['db']['dbpassword'],
                'database' => $ecms_config['db']['dbname'],
                'charset'  => $ecms_config['db']['dbchar'],
                'prefix'   => $ecms_config['db']['dbtbpre']
            ),
        );

        return $config;
    }


    private function checkNitc()
    {
        $configFile = APP_PATH . "config.php";
        if (!file_exists($configFile)) {
            showMessage("无法获取配置文件，接口无法正常工作");
        }
        $db_host = $db_user = $db_pass = $db_name = $prefix = '';
        require_once($configFile);
        $hostArr = explode(":", $db_host);
        $config = array(
            "provider" => 'wordpress',
            "database" => array(
                'host'     => $hostArr[0],
                'port'     => $hostArr[1],
                'user'     => $db_user,
                'password' => $db_pass,
                'database' => $db_name,
                'charset'  => 'utf8',
                'prefix'   => $prefix
            ),
        );

        return $config;
    }

    private function writeConfig($config)
    {
        if (empty($config)) {
            showMessage("无法获取配置文件，接口无法正常工作");
        }
        $configString = "<?php\n\n//appclient配置文件\nreturn " . var_export($config, true) . ";\n";
        $result = file_put_contents($this->configPath, $configString);
        if(!$result){
            showMessage("无法写入配置，目录权限不足");
        }
    }
}

class appAction
{
    public $provider;
    public $pageConfig;
    public $data;

    public function __construct($config)
    {
        $this->provider = new provider($config);
    }

    public function handle()
    {
        $funcName = $_GET['a'] . "Action";
        if (method_exists($this, $funcName)) {
            $this->_initTags();
            $this->{$funcName}();
        } else {
            if($_SERVER['HTTP_VERSION']){
                res(-1, '错误的入口');
            }else{
                showMessage('接口访问正常');
            }
        }
    }

    private function _initTags()
    {
        if (isset($_GET['tags'])) {
            $tags = json_decode($_GET['tags'], true);
            if (is_array($tags)) {
                foreach ($tags as $dataName => $item) {
                    $this->data[$dataName] = $this->_addTagData($item['tag'], $item['args'], $item['children']);
                }
            }
        }
    }

    private function _addTagData($tag, $args, $children = null)
    {
        $tagName = "get" . ucfirst($tag);
        $data = null;
        if (method_exists($this->provider, $tagName)) {
            $data = $this->provider->$tagName($args);
            if (isset($data['data'])) {
                $isEmpty = empty($data['data']);
            } else {
                $isEmpty = empty($data);
            }
            if (!empty($children) && !$isEmpty) {
                $eachData = isset($data['data']) ? $data['data'] : $data;
                foreach ($eachData as $key => &$datum) {
                    foreach ($children as $childName => $child) {
                        $childArgs = $child['args'];
                        foreach ($childArgs as $k => $v) {
                            if (strpos($v, 'parent:') === 0) {
                                $parentKey = substr($v, 7);
                                $childArgs[$k] = $datum[$parentKey];
                            }
                        }
                        $datum[$childName] = $this->_addTagData($child['tag'], $childArgs, $child['children']);
                    }
                }
                isset($data['data']) ? $data['data'] = $eachData : $data = $eachData;
            }
        }

        return $data;
    }

    /**
     * 首页
     */
    public function indexAction()
    {
        $settings = $this->provider->getSetting();
        $this->_pageConfig($settings);
        res(0, null, $this->data);
    }

    public function categoriesAction()
    {

    }

    public function categoryAction()
    {
        $id = intval($_GET['id']);
        $category = $this->provider->getCategory(array('id' => $id, 'child' => $_GET['child']));
        $this->data['category'] = $category;
        $this->_pageConfig($category);
        res(0, null, $this->data);
    }

    public function listAction()
    {
        $categoryId = intval($_GET['categoryId']);
        $page = intval($_GET['page']);
        $row = intval($_GET['row']);
        if ($page < 1) {
            $page = 1;
        }
        if ($row < 1) {
            $row = 1;
        }
        $category = $this->provider->getCategory(array('id' => $categoryId));
        if (!$category) {
            res(-1, '分类内容不存在');
        }
        $args = array(
            'categoryId' => $categoryId,
            'page'       => $page,
            'row'        => $row
        );
        $args = array_merge($_GET, $args);
        if ($category['model'] == 'product') {
            $result = $this->provider->getProducts($args);
        } else {
            $result = $this->provider->getArticles($args);
        }
        $hasNext = $page * $row < $result['count'] ? true : false;
        res(0, null, $result['data'], array(
            'count'   => $result['count'],
            'hasNext' => $hasNext,
        ));
    }

    public function postsAction()
    {
        res(0, null, $this->data);
    }

    public function articlesAction()
    {

        res(0, null, $this->data);
    }

    public function articleAction()
    {
        $id = intval($_GET['id']);
        $datum = $this->provider->getArticle(array('id' => $id));
        $this->data['article'] = $datum;
        $this->_pageConfig($datum);
        res(0, null, $this->data);
    }

    public function productsAction()
    {
        $categoryId = intval($_GET['categoryId']);
        $page = intval($_GET['page']);
        res(0, null, $this->data);
    }

    public function productAction()
    {
        $id = intval($_GET['id']);
        $datum = $this->provider->getProduct(array('id' => $id));
        if (!$datum) {
            res(-1, '产品不存在');
        }
        $this->data['product'] = $datum;
        $this->_pageConfig($datum);
        res(0, null, $this->data);
    }

    public function defaultAction()
    {
        res(0, null, $this->data);
    }

    public function settingAction()
    {
        $settings = $this->provider->getSetting();
        res(0, null, array(
            'setting' => $settings
        ));
    }

    public function pageAction()
    {
        $page = $_GET['page'];
        $pageId = $_GET['pageId'];
        $datum = $this->provider->getPage(array('page' => $page, 'pageId' => $pageId));
        $this->data['page'] = $datum;
        res(0, null, $this->data);
    }

    public function updateAction()
    {
        $version = $_SERVER['HTTP_VERSION'];
        $domain  = $_SERVER['HTTP_HOST'];
        $url = 'https://www.mingze.vip/version/app';
        $remoteVersion = $this->request($url, 'get', array('version' => $version, 'domain' => $domain));
        $remoteVersion = json_decode($remoteVersion, true);

        if($remoteVersion == null){
            res(0, null);
        }

        if($remoteVersion['code'] !== 0){
            res($remoteVersion['code'], $remoteVersion['msg']);
        }

        res(0, '不需要更新');
    }

    public function sitemapAction(){
        $sitemap = $this->provider->getSitemap();

        $content = implode("\r\n", $sitemap);
        header("Content-type:text/plan");
        /*header("Content-type:application/octet-stream");
        header("Accept-Ranges:bytes");
        header("Accept-Length:".strlen($content));
        header("Content-Disposition: attachment; filename=sitemap.txt");*/

        echo $content;
    }

    public function mappingAction(){
        $sitemap = $this->provider->getMapping();

        header("Content-type:text/plan");
        //$content = implode("\r\n", $sitemap);
        foreach($sitemap as $key => $item){
            echo "$key => $item\r\n";
        }
        /*header("Content-type:application/octet-stream");
        header("Accept-Ranges:bytes");
        header("Accept-Length:".strlen($content));
        header("Content-Disposition: attachment; filename=sitemap.txt");*/

        //echo $content;
    }

    private function _pageConfig($data)
    {
        if (!$data['seoTitle']) {
            $data['seoTitle'] = $data['title'];
        }
        $this->data['pageConfig'] = array(
            "seoTitle"    => $data['seoTitle'],
            "keywords"    => $data['keywords'],
            "description" => $data['description'],
            "title"       => $data['title'] ? $data['title'] : $data['seoTitle'],
            "addTime"     => $data['addTime'],
            "image"       => $data['logo'],
        );
    }

    private function request($url, $method = 'GET', $postFields = null, $time_out = 5)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($curl, CURLOPT_TIMEOUT, $time_out);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($curl, CURLOPT_HEADER, FALSE);

        if(is_array($postFields)){
            $postFields = http_build_query($postFields);
        }

        $method = strtoupper($method);
        if($method == 'POST'){
            curl_setopt($curl, CURLOPT_POST, TRUE);
            if ($postFields) {
                curl_setopt($curl, CURLOPT_POSTFIELDS, $postFields);
            }
        }else{
            if($postFields){
                if(strpos($url, '?') !== false){
                    $url .= "&" . $postFields;
                }else{
                    $url .= "?" . $postFields;
                }
            }
        }

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLINFO_HEADER_OUT, TRUE);

        if (substr($url, 0, 8) == 'https://') {
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        }

        $response = curl_exec($curl);
        curl_close($curl);

        return $response;
    }
}

class provider
{
    protected $categoryFields = array(
        'id'          => '',
        'title'       => '',
        'content'     => '',
        'parentId'    => '',
        'seoTitle'    => '',
        'keywords'    => '',
        'description' => '',
        'modelId'     => '',
        'typeId'      => '',
        'status'      => '',
        'sort'        => '',
        'logo'        => '',
        'views'       => '',
        'slug'        => '',
        'addTime'     => '',
    );
    protected $articleFields = array(
        'id'          => '',
        'title'       => '',
        'content'     => '',
        'typeId'      => '',
        'parentId'    => '',
        'seoTitle'    => '',
        'keywords'    => '',
        'description' => '',
        'status'      => '',
        'sort'        => '',
        'logo'        => '',
        'views'       => '',
        'categoryId'  => '',
        'slug'        => '',
        'addTime'     => '',
    );
    protected $productFields = array(
        'id'          => '',
        'title'       => '',
        'content'     => '',
        'typeId'      => '',
        'parentId'    => '',
        'seoTitle'    => '',
        'keywords'    => '',
        'description' => '',
        'status'      => '',
        'sort'        => '',
        'logo'        => '',
        'views'       => '',
        'categoryId'  => '',
        'slug'        => '',
        'money'       => '',
        'addTime'     => '',
    );
    /**
     * @var dedecmsProvider
     */
    public $provider;
    public $config;

    public function __construct($config)
    {
        $providerName = $config['provider'] . 'Provider';
        $this->provider = new $providerName($config);
    }

    public function initApp(){
        $this->provider->initApp();
    }

    public function getSetting()
    {
        return $this->provider->getSetting();
    }

    public function getCategories($args = null)
    {
        return $this->provider->getCategories($args);
    }

    public function getCategory($args)
    {
        $category = $this->provider->getCategory($args);
        
        return $category;
    }

    public function getPosts($args = null)
    {
        return $this->provider->getPosts($args);
    }

    public function getArticles($args = null)
    {
        return $this->provider->getArticles($args);
    }

    public function getArticle($args)
    {
        $article = $this->provider->getArticle($args);

        return $article;
    }

    public function getProducts($args = null)
    {
        return $this->provider->getProducts($args);
    }

    public function getProduct($args)
    {
        $product = $this->provider->getProduct($args);

        return $product;
    }

    public function getPage($args)
    {
        $page = $this->provider->getPage($args);

        return $page;
    }

    public function getSitemap($args = null){
        $sitemap = array(
            "pages/index/index",
            "pages/about/index",
            "pages/contact/index",
            "pages/products/index",
            "pages/articles/index"
        );
        $categories = $this->provider->getCategories();
        foreach ($categories as $item){
            $sitemap[] = "pages/category/index?id=" . $item['id'];
        }
        $products = $this->provider->getProducts(array('result' => 'all'));
        foreach ($products['data'] as $item){
            $sitemap[] = "pages/product/index?id=" . $item['id'];
        }
        $articles = $this->provider->getArticles(array('result' => 'all'));
        foreach ($articles['data'] as $item){
            $sitemap[] = "pages/article/index?id=" . $item['id'];
        }

        return $sitemap;
    }

    public function getMapping($args = null){
        $sitemap = $this->provider->getMapping($args);

        return $sitemap;
    }
}

class dedecmsProvider
{
    protected $db;
    protected $settings;
    protected $productCategoryIds;

    public function __construct($config)
    {
        $this->db = new pdoMysql($config['database']);
    }

    public function initApp(){
        $defaultSetting = array(
            array('varname' => 'app_mobile', 'value' => '', 'info' => '联系电话', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_logo', 'value' => 'http://www.dedecms.com/img/top_logo.jpg', 'info' => '小程序logo', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_company', 'value' => '', 'info' => '公司名称', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_address', 'value' => '', 'info' => '公司地址', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_about_id', 'value' => '', 'info' => '关于我们分类id', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_contact_id', 'value' => '', 'info' => '联系我们分类id', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_ignore_category', 'value' => '', 'info' => '需要排除的栏目,多个,隔开：', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_product_model_id', 'value' => '', 'info' => '产品模型id，默认是6：', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_product_category', 'value' => '', 'info' => '产品分类，只有在使用产品模型的时候才需要填写：', 'groupid' => 1, 'type' => 'string'),
            array('varname' => 'app_show_product', 'value' => '', 'info' => '是否显示产品，1显示，0不显示：', 'groupid' => 1, 'type' => 'string'),
        );
        foreach ($defaultSetting as $value){
            $exists = $this->db->getOne('varname', "sysconfig", "varname = '{$value['varname']}'");
            if(!$exists){
                $this->db->insert($value, "sysconfig", false, true);
            }
        }
    }

    public function getSetting()
    {
        $args = $_GET;
        if ($this->settings) {
            return $this->settings;
        }
        $result = $this->db->select('varname,value', "sysconfig");
        $settings = array();
        /**
         * 内部需要
         */
        $settings['app_ignore_category'] = $args['ignoreCategory'];
        $settings['app_product_model_id'] = $args['productModelId'];
        $settings['app_product_category'] = $args['productCategory'];
        $settings['app_show_product'] = $args['showProduct'];

        foreach ($result as $value) {
            if(in_array($value['varname'], [
                'app_ignore_category',
                'app_product_model_id',
                'app_product_category',
                'app_show_product'
            ]) && !$value['value']){
                continue;
            }
            $settings[$value['varname']] = $value['value'];
        }
        $this->settings = array(
            'seoTitle'    => $settings['cfg_webname'],
            'keywords'    => $settings['cfg_keywords'],
            'description' => $settings['cfg_description'],
            'mobile'      => $settings['app_mobile'],
            'logo'        => $settings['app_logo'],
            'aboutId'     => $settings['app_about_id'],
            'contactId'   => $settings['app_contact_id'],
            'company'     => $settings['app_company'],
            'address'     => $settings['app_address'],
            'ignoreCategory'  => $settings['app_ignore_category'],
            'productModelId' => $settings['app_product_model_id'] ? $settings['app_product_model_id'] : 6,
            'productCategory' => $settings['app_product_category'],
            'showProduct'     => $settings['app_show_product'],
        );

        return $this->settings;
    }

    public function getCategories($args = null)
    {
        $settings = $this->getSetting();
        $where = array("corank = 0 and ishidden = 0");
        if($settings['ignoreCategory']){
            //兼容处理
            $settings['ignoreCategory'] = str_replace("，", ",", $settings['ignoreCategory']);
            $where[] = "id NOT IN({$settings['ignoreCategory']})";
        }
        //支持指定id
        if($args['categoryId']){
            if (strpos($args['categoryId'], ',') !== false) {
                $where[] = "id IN({$args['categoryId']})";
            } else {
                $where[] = 'id IN (' . implode(',', $this->_getSubCatIds($args['categoryId'])) . ')';
            }
        }else if ($args['model']) {
            //检查
            $productCategoryIds = null;
            $productCategoryIds = $this->_getProductCategoryIds();

            if($productCategoryIds){
                if($args['model'] == 'product'){
                    $where[] = 'id IN (' . implode(',', $productCategoryIds) . ')';
                }else{
                    $where[] = 'id NOT IN (' . implode(',', $productCategoryIds) . ')';
                }
            }else{
                $modelId = $this->_getModelId($args['model']);
                $where[] = "channeltype IN($modelId)";
            }
        }
        if (isset($args['parentId'])) {
            $where[] = "reid = '{$args['parentId']}'";
        }
        $categories = $this->db->select("id,reid as parentId,sortrank as sort,typename as title,channeltype as modelId,ispart as typeId,description,typedir,defaultname,namerule", "arctype", implode(' AND ', $where), $args['row'], "parentId ASC,sort ASC,id ASC");
        foreach ($categories as $key => $category) {
            if ($args['child']) {
                $category['children'] = $this->db->select("id,reid as parentId,sortrank as sort,typename as title,channeltype as modelId,ispart as typeId,description", "arctype", "reid = '{$category['id']}", $args['row'], "sort ASC,id ASC");
                foreach ($category['children'] as $key => $child) {
                    //增加内容属性
                    $child['model'] = $this->_getModel($child['modelId'], $child['id']);
                    $category['children'][$key] = $child;
                }
            }
            $category['model'] = $this->_getModel($category['modelId'], $category['id']);
            $categories[$key] = $category;
        }
        usort($categories, function($item1, $item2){
            return $item1['model'] < $item2['model'];
        });

        return $categories;
    }

    public function getCategory($args)
    {
        $category = $this->db->getOne("id,reid as parentId,sortrank as sort,typename as title,channeltype as modelId,ispart as typeId,description,keywords,seotitle as seoTitle,content", 'arctype', "id = {$args['id']}");
        if (!$category) {
            return null;
        }
        //增加内容属性
        $category['model'] = $this->_getModel($category['modelId'], $category['id']);
        if ($args['child']) {
            $category['children'] = $this->db->select("id,reid as parentId,sortrank as sort,typename as title,channeltype as modelId,ispart as typeId,description", "arctype", "reid = '{$category['id']}'", "", "sort ASC");
            foreach ($category['children'] as $key => $child) {
                //增加内容属性
                $child['model'] = $this->_getModel($child['modelId'], $child['id']);
                $category['children'][$key] = $child;
            }
        }

        return $category;
    }

    public function getPosts($args = null)
    {
        return $this->_getArchives($args);
    }

    public function getArticles($args = null)
    {
        $args['modelId'] = "1,2";

        return $this->_getArchives($args);
    }

    public function getArticle($args)
    {
        $args['modelId'] = "1,2";

        return $this->_getArchive($args);
    }

    public function getProducts($args = null)
    {
        $args['modelId'] = 6;

        return $this->_getArchives($args);
    }

    public function getProduct($args)
    {
        $args['modelId'] = 6;

        return $this->_getArchive($args);
    }

    public function getPage($args)
    {
        $settings = $this->getSetting();
        $pageId = 0;
        switch ($args['page']) {
            case 'about':
                $pageId = $settings['aboutId'];
                break;
            case 'contact':
                $pageId = $settings['contactId'];
                break;
        }
        if(!$pageId && $args['pageId']){
            $pageId = $args['pageId'];
        }
        if (!$pageId) {
            return null;
        }
        //默认读取的是单页，如果不存在，则尝试读取分类
        $datum = $this->db->getOne("aid as id,title,filename,body as content,uptime as addTime", 'sgpage', "aid = '$pageId'");

        if(!$datum) {
            $datum = $this->getCategory(array('id' => $pageId));
        }
        return $datum;
    }

    public function getMapping($args = null){
        $settings = $this->getSetting();

        $categories = $this->getCategories();
        $newCategories = array();
        foreach ($categories as $item){
            $newCategories[$item['id']] = $item;
        }
        unset($categories);

        $sitemap = array(
            BASE_URL => "pages/index/index",
        );

        foreach ($newCategories as $item){
            if(strpos($item['typedir'], 'http') === false) {
                $url = str_replace('{cmspath}/', BASE_URL, $item['typedir']) . "/" . $item["defaultname"];
            }else{
                $url = $item['typedir'];
            }
            if($item['id'] == $settings['aboutId']){
                $appUrl = "pages/about/index";
            }else if($item['id'] == $settings['contactId']){
                $appUrl = "pages/contact/index";
            }else{
                $appUrl = "pages/category/index?id=" . $item['id'];
            }

            $sitemap[$url] = $appUrl;
        }

        $products = $this->getProducts(array('result' => 'all'));
        foreach ($products['data'] as $item){
            $category = $newCategories[$item['categoryId']];
            if(!$category){
                continue;
            }
            $y = date('Y', $item['addTime']);
            $m = date('m', $item['addTime']);
            $d = date('d', $item['addTime']);
            $url = str_replace('{Y}', $y, $category['namerule']);
            $url = str_replace('{M}', $m, $url);
            $url = str_replace('{D}', $d, $url);
            $url = str_replace('{aid}', $item['id'], $url);
            $typedir = str_replace('{cmspath}/', BASE_URL, $category['typedir']);
            $url = str_replace('{typedir}', $typedir, $url);
            $sitemap[$url] = "pages/product/index?id=" . $item['id'];
        }
        $articles = $this->getArticles(array('result' => 'all'));
        foreach ($articles['data'] as $item){
            $category = $newCategories[$item['categoryId']];
            if(!$category){
                continue;
            }
            $y = date('Y', $item['addTime']);
            $m = date('m', $item['addTime']);
            $d = date('d', $item['addTime']);
            $url = str_replace('{Y}', $y, $category['namerule']);
            $url = str_replace('{M}', $m, $url);
            $url = str_replace('{D}', $d, $url);
            $url = str_replace('{aid}', $item['id'], $url);
            $typedir = str_replace('{cmspath}/', BASE_URL, $category['typedir']);
            $url = str_replace('{typedir}', $typedir, $url);
            $sitemap[$url] = "pages/article/index?id=" . $item['id'];
        }

        return $sitemap;
    }

    private function _getArchives($args)
    {
        if (!$args['page']) {
            $args['page'] = 1;
        }
        if (!$args['row']) {
            $args['row'] = 10;
        }
        if($args['result'] == 'all') {
            $args['row'] = 100000;
        }
        if(!$args['order']){
            $args['order'] = 'desc';
        }
        $where = array("arcrank > -1");

        if ($args['sudDay']) {
            $where[] = "senddate > " . strtotime("-{$args['sudDay']} day");
        }
        if ($args['keyword']) {
            $keyword = str_replace(',', '|', $args['keyword']);
            $where[] = "CONCAT(title,keywords) REGEXP '$keyword'";
        }
        if ($args['categoryId']) {
            if (strpos($args['categoryId'], ',') !== false) {
                $where[] = "typeid IN ({$args['categoryId']})";
            } else {
                $where[] = 'typeid IN (' . implode(',', $this->_getSubCatIds($args['categoryId'])) . ')';
            }
        } elseif ($args['modelId']) {
            //产品
            $productCategoryIds = null;
            if($args['modelId'] == 6){
                $productCategoryIds = $this->_getProductCategoryIds();
            }

            if($productCategoryIds){
                $where[] = 'typeid IN (' . implode(',', $productCategoryIds) . ')';
            }else{
                $where[] = "channel IN({$args['modelId']})";
            }
        }
        if ($args['flag']) {
            if (strpos(',', $args['flag']) === false) {
                $where[] = "FIND_IN_SET('{$args['flag']}', flag)";
            } else {
                $flags = explode(',', $args['flag']);
                foreach ($flags as $flag) {
                    if (trim($flag) == '') continue;
                    $where[] = "FIND_IN_SET('$flag', flag)";
                }
            }
        }
        if ($args["ids"]) {
            $where = array("id in({$args['ids']})");
        }

        if ($args['orderby'] == 'hot' || $args['orderby'] == 'click') $order = "click {$args['order']}";
        else if ($args['orderby'] == 'sort' || $args['orderby'] == 'pubdate') $order = "sortrank {$args['order']}";
        else if ($args['orderby'] == 'id') $order = "id {$args['order']}";
        else if ($args['orderby'] == 'near') $order = "ABS(cast(id as signed) - " . $args['id'] . ")";
        else if ($args['orderby'] == 'last') $order = "lastpost {$args['order']}";
        else if ($args['orderby'] == 'rand') $order = "rand()";
        else $order = "sortrank {$args['order']}";
        $counter = $this->db->count(implode(' and ', $where), 'archives');
        if($args['id']){
            $where[] = "id != '{$args['id']}'";
        }

        $articles = array();
        if ($counter > 0) {
            $limit = ($args['page'] - 1) * $args['row'] . "," . $args['row'];
            $articles = $this->db->select("id, typeid as categoryId, channel as modelId, title, writer as author, litpic as logo, senddate as addTime, description, click as views", "archives", implode(' and ', $where), $limit, $order);
            foreach ($articles as $key => $article) {
                //增加内容属性
                $article['model'] = $this->_getModel($article['modelId'], $article['categoryId']);
                //处理默认缩略图等
                if (isset($article['logo'])) {
                    if ($article['logo'] == '-' || $article['logo'] == '') {
                        $article['logo'] = '';
                    }
                    if ($article['logo'] && strpos($article['logo'], 'http') === false) {
                        $article['logo'] = BASE_URL . ltrim($article['logo'], '/');
                    }
                }
                $articles[$key] = $article;
            }
        }

        return array('count' => $counter, 'data' => $articles);
    }

    private function _getArchive($args)
    {
        $settings = $this->getSetting();
        $args['id'] = intval($args['id']);
        $article = $this->db->getOne("id, typeid as categoryId, channel as modelId, title, writer as author, litpic as logo, senddate as addTime, description, click as views", 'archives', "id='{$args['id']}'");

        if (empty($article)) {
            return null;
        }
        //增加内容属性
        $article['model'] = $this->_getModel($article['modelId'], $article['categoryId']);
        //获取addon表
        $addonTable = $this->db->getOneCol("addtable", 'channeltype', "id = '{$article['modelId']}'");
        $addon = $this->db->getOne("*", $addonTable, "aid = '{$args['id']}'");
        $contentField = 'body';
        if(!isset($addon['body'])){
            if(isset($addon['message'])){
                $contentField = 'message';
            }elseif(isset($addon['content'])){
                $contentField = 'content';
            }else{
                $fields = array_keys($addon);
                foreach ($fields as $field){
                    if(strpos($field, 'body') !== false || strpos($field, 'message') !== false || strpos($field, 'content') !== false || strpos($field, 'detail') !== false){
                        $contentField = $field;
                        break;
                    }
                }
            }
        }

        $article['content'] = $addon[$contentField];
        $article['money'] = $addon['trueprice'];
        $article['origin'] = $addon['price'];
        //读取分类
        $article['category'] = $this->getCategory(array("id" => $article['categoryId']));
        //完成附加表信息读取
        //处理默认缩略图等
        if (isset($article['logo'])) {
            if ($article['logo'] == '-' || $article['logo'] == '') {
                $article['logo'] = '';
            }
            if ($article['logo'] && strpos($article['logo'], 'http') === false) {
                $article['logo'] = BASE_URL . ltrim($article['logo'], '/');
            }
        }
        //内容路径替换
        preg_match_all('/<img[^src]*src=["|\']([^"\']*)["|\'][^>]*/i', $article['content'], $matches);
        if ($matches[1]) {
            foreach ($matches[1] as $k => $item) {
                if (!preg_match("/^http/",$item)) {
                    $article['content'] = str_replace($item, BASE_URL . ltrim(str_replace('../', '/', $item), '/'), $article['content']);
                }
            }
        }
        preg_match_all('/<a[^href]*href=["|\']([^"\']*)["|\']/i', $article['content'], $matches);
        if ($matches[1]) {
            foreach ($matches[1] as $k => $item) {
                if (!preg_match("/^http/",$item)) {
                    $article['content'] = str_replace($item, BASE_URL . ltrim(str_replace('../', '/', $item), '/'), $article['content']);
                }
            }
        }
        //上下篇
        $article['next'] = $this->db->getOne("id, typeid as categoryId, channel as modelId, title, writer as author, senddate as addTime, description, click as views", "archives", "arcrank > -1 AND id > {$article['id']} AND typeid='{$article['categoryId']}'", "id ASC");
        $article['prev'] = $this->db->getOne("id, typeid as categoryId, channel as modelId, title, writer as author, senddate as addTime, description, click as views", "archives", "arcrank > -1 AND id < {$article['id']} AND typeid='{$article['categoryId']}'", "id DESC");

        return $article;
    }

    private function _getProductCategoryIds(){
        if($this->productCategoryIds){
            return $this->productCategoryIds;
        }
        $settings = $this->getSetting();
        if($settings['showProduct'] && $settings['productCategory']){
            $this->productCategoryIds = $this->_getSubCatIds($settings['productCategory']);
        }

        return $this->productCategoryIds;
    }

    private function _getModel($modelId, $categoryId)
    {
        $settings = $this->getSetting();
        $productModelId = $settings['productModelId'];
        $productCategoryIds = $this->_getProductCategoryIds();
        if($productCategoryIds){
            if(in_array($categoryId, $productCategoryIds)){
                return 'product';
            }
        }

        switch ($modelId) {
            case $productModelId:
                $model = 'product';
                break;
            default:
                $model = 'article';
                break;
        }

        return $model;
    }

    private function _getModelId($model)
    {
        $settings = $this->getSetting();
        $productModelId = $settings['productModelId'];
        switch ($model) {
            case 'product':
                $modelId = $productModelId;
                break;
            default:
                $modelId = "1,2";
                break;
        }

        return $modelId;
    }

    private function _getSubCatIds($categoryId, $topId = null)
    {
        $categories = $this->db->select("id, reid as parentId", "arctype");

        //$categories = $this->db->select("id,reid as parentId", "arctype", "topid = '{$topId}'");
        $ids = array($categoryId => $categoryId);
        if (!empty($categories)) {
            foreach ($categories as $category) {
                if (in_array($category['parentId'], $ids)) {
                    $ids[$category['id']] = $category['id'];
                }
                foreach ($categories as $v) {
                    if (in_array($v['parentId'], $ids)) {
                        $ids[$v['id']] = $v['id'];
                    }
                }
                foreach ($categories as $v) {
                    if (in_array($v['parentId'], $ids)) {
                        $ids[$v['id']] = $v['id'];
                    }
                }
            }
        }

        return array_values($ids);
    }
}

class phpcmsProvider
{
    //todo phpcms
}

class wordpressProvider
{
    //todo wordpress
}

class empireProvider
{
    //todo 帝国
}

/**
 * 数据库操作类
 */
class pdoMysql
{
    private $config = null;
    /** @var PDO */
    public $link = null;
    /** @var PDOStatement|int */
    public $lastqueryid = null;
    public $querycount = 0;

    public function __construct($config)
    {
        if (!$config['port']) {
            $config['port'] = 3306;//默认端口
        }
        if (!$config['charset']) {
            $config['charset'] = 'utf8';
        }
        $this->config = $config;
        $this->config['dsn'] = 'mysql:host=' . $config['host'] . ';port=' . $config['port'] . ';dbname=' . $config['database'];
        $this->connect();
    }

    public function connect()
    {
        try {
            $this->link = new PDO($this->config['dsn'], $this->config['user'], $this->config['password'], array(
                PDO::ATTR_PERSISTENT         => true,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
            ));
        } catch (Exception $e) {
            res(-1, $e->getMessage());
        }
        //重置sql_mode,防止datetime,group by 出错
        $this->link->query("set sql_mode=''");

        return $this->link;
    }

    private function execute($sql)
    {
        if (!is_object($this->link)) {
            $this->connect();
        }
        $this->lastqueryid = $this->link->exec($sql);
        $this->querycount++;

        return $this->lastqueryid;
    }

    public function query($sql = null)
    {
        if (!is_object($this->link)) {
            $this->connect();
        }
        $this->lastqueryid = $this->link->query($sql) or $this->halt("", $sql);
        $this->querycount++;

        return $this->lastqueryid;
    }

    public function select($data, $table, $where = '', $limit = '', $order = '', $group = '', $key = '')
    {
        $where = $where == '' ? '' : ' WHERE ' . $where;
        $order = $order == '' ? '' : ' ORDER BY ' . $order;
        $group = $group == '' ? '' : ' GROUP BY ' . $group;
        $limit = $limit == '' ? '' : ' LIMIT ' . $limit;
        $field = explode(',', $data);
        array_walk($field, array($this, 'addSpecialChar'));
        $data = implode(',', $field);

        $sql = 'SELECT ' . $data . ' FROM `' . $this->config['database'] . '`.`' . $this->getTable($table) . '`' . $where . $group . $order . $limit;

        $this->query($sql);
        if (!is_object($this->lastqueryid)) {
            return $this->lastqueryid;
        }
        $datalist = $this->lastqueryid->fetchAll();
        if ($key) {
            $datalist_new = array();
            foreach ($datalist as $i => $item) {
                $datalist_new[$item[$key]] = $item;
            }
            $datalist = $datalist_new;
            unset($datalist_new);
        }
        $this->freeResult();

        return $datalist;
    }

    public function getOne($data, $table, $where = '', $order = '', $group = '')
    {
        $where = $where == '' ? '' : ' WHERE ' . $where;
        $order = $order == '' ? '' : ' ORDER BY ' . $order;
        $group = $group == '' ? '' : ' GROUP BY ' . $group;
        $limit = ' LIMIT 1';
        $field = explode(',', $data);
        array_walk($field, array($this, 'addSpecialChar'));
        $data = implode(',', $field);
        $sql = 'SELECT ' . $data . ' FROM `' . $this->config['database'] . '`.`' . $this->getTable($table) . '`' . $where . $group . $order . $limit;
        $this->query($sql);
        $res = $this->lastqueryid->fetch();
        $this->freeResult();

        return $res;
    }

    public function getOneCol($data, $table, $where = '', $order = '', $group = '')
    {
        $where = $where == '' ? '' : ' WHERE ' . $where;
        $order = $order == '' ? '' : ' ORDER BY ' . $order;
        $group = $group == '' ? '' : ' GROUP BY ' . $group;
        $limit = ' LIMIT 1';
        $field = explode(',', $data);
        array_walk($field, array($this, 'addSpecialChar'));
        $data = implode(',', $field);
        $fieldname = str_replace('`', '', $data);
        $sql = 'SELECT ' . $data . ' FROM `' . $this->config['database'] . '`.`' . $this->getTable($table) . '`' . $where . $group . $order . $limit;
        $this->query($sql);
        $res = $this->lastqueryid->fetch();
        $this->freeResult();

        $result = isset($res[$fieldname]) ? $res[$fieldname] : false;

        return $result;
    }

    public function insert($data, $table, $return_insertId = false, $replace = false)
    {
        if (!is_array($data) || $table == '' || count($data) == 0) {
            return false;
        }
        $fielddata = array_keys($data);
        $valuedata = array_values($data);
        array_walk($fielddata, array($this, 'addSpecialChar'));
        array_walk($valuedata, array($this, 'escapeString'));
        $field = implode(',', $fielddata);
        $value = implode(',', $valuedata);
        $cmd = $replace ? 'REPLACE INTO' : 'INSERT INTO';
        $sql = $cmd . ' `' . $this->config['database'] . '`.`' . $this->getTable($table) . '`(' . $field . ') VALUES (' . $value . ')';
        $return = $this->execute($sql);

        return $return_insertId ? $this->insertId() : $return;
    }

    /**
     * update 不支持order by
     * @param        $data
     * @param        $table
     * @param string $where
     * @param string $order
     * @param string $limit
     * @return bool|int|PDOStatement
     */
    public function update($data, $table, $where = '', $order = "", $limit = "")
    {
        if ($table == '' or $where == '') {
            return false;
        }
        $where = ' WHERE ' . $where;
        if (is_string($data) && $data != '') {
            $field = $data;
        } elseif (is_array($data) && count($data) > 0) {
            $fields = array();
            foreach ($data as $k => $v) {
                switch (substr($v, 0, 2)) {
                    case '+=':
                        $v = substr($v, 2);
                        if (is_numeric($v)) {
                            $fields[] = $this->addSpecialChar($k) . '=' . $this->addSpecialChar($k) . '+' . $this->escapeString($v, '', false);
                        }
                        break;
                    case '-=':
                        $v = substr($v, 2);
                        if (is_numeric($v)) {
                            $fields[] = $this->addSpecialChar($k) . '=' . $this->addSpecialChar($k) . '-' . $this->escapeString($v, '', false);
                        }
                        break;
                    default:
                        //对自增自减字段的特殊处理
                        if (preg_match('/^`[a-z_0-9]+`\s*[\+\-]\s*[0-9]+$/', $v)) {
                            $fields[] = $this->addSpecialChar($k) . '=' . $v;
                        } else {
                            $fields[] = $this->addSpecialChar($k) . '=' . $this->escapeString($v);
                        }
                }
            }
            $field = implode(',', $fields);
        } else {
            return false;
        }
        $order = !empty($order) ? " ORDER BY " . $order : "";
        $limit = !empty($limit) ? " LIMIT " . $limit : "";
        $sql = 'UPDATE `' . $this->config['database'] . '`.`' . $this->getTable($table) . '` SET ' . $field . $where . $order . $limit;

        return $this->execute($sql);
    }

    public function delete($table, $where)
    {
        if ($table == '' || $where == '') {
            return false;
        }
        $where = ' WHERE ' . $where;
        $sql = 'DELETE FROM `' . $this->config['database'] . '`.`' . $this->getTable($table) . '`' . $where;

        return $this->execute($sql);
    }

    public function count($where = '', $table, $group = '')
    {
        $r = $this->getOne("COUNT(*) AS num", $table, $where, '', $group);

        return $r['num'];
    }

    public function fetchAll($res = null)
    {
        $type = PDO::FETCH_ASSOC;
        if ($res) {
            $res_query = $res;
        } else {
            $res_query = $this->lastqueryid;
        }

        return $res_query->fetchAll($type);
    }

    public function affectedRows()
    {
        return is_numeric($this->lastqueryid) ? $this->lastqueryid : 0;
    }

    public function getPrimary($table)
    {
        $this->query("SHOW COLUMNS FROM " . $this->getTable($table));
        while ($r = $this->lastqueryid->fetch()) {
            if ($r['Key'] == 'PRI') break;
        }

        return $r['Field'];
    }

    public function getFields($table)
    {
        $fields = array();
        $this->query("SHOW COLUMNS FROM " . $this->getTable($table));
        while ($r = $this->lastqueryid->fetch()) {
            $fields[$r['Field']] = $r['Type'];
        }

        return $fields;
    }

    public function checkFields($table, $array)
    {
        $fields = $this->getFields($table);
        $nofields = array();
        foreach ($array as $v) {
            if (!array_key_exists($v, $fields)) {
                $nofields[] = $v;
            }
        }

        return $nofields;
    }

    public function tableExists($table)
    {
        $tables = $this->listTables();

        return in_array($table, $tables) ? 1 : 0;
    }

    public function listTables()
    {
        $tables = array();
        $this->query("SHOW TABLES");
        while ($r = $this->lastqueryid->fetch()) {
            $tables[] = $r['Tables_in_' . $this->config['database']];
        }

        return $tables;
    }

    public function fieldExists($table, $field)
    {
        $fields = $this->getFields($table);

        return array_key_exists($field, $fields);
    }

    public function getTable($table)
    {
        if (!$this->config['prefix']) {
            return $table;
        }
        if (strpos($table, $this->config['prefix']) === false) {
            return $this->config['prefix'] . $table;
        }

        return $table;
    }

    public function numRows($sql)
    {
        $this->query($sql);

        return $this->lastqueryid->rowCount();
    }

    public function num_fields($sql)
    {
        $this->query($sql);

        return $this->lastqueryid->columnCount();
    }

    public function result($sql, $row)
    {
        $this->query($sql);

        return $this->lastqueryid->fetchColumn($row);
    }

    public function error()
    {
        return $this->link->errorInfo();
    }

    public function errno()
    {
        return intval($this->link->errorCode());
    }

    public function insertId()
    {
        return $this->link->lastInsertId();
    }

    public function freeResult()
    {
        if (is_object($this->lastqueryid)) {
            $this->lastqueryid = null;
        }
    }

    public function close()
    {
        if (is_object($this->link)) {
            unset($this->link);
        }
    }

    /**
     * 对字段两边加反引号，以保证数据库安全
     * @param $value 数组值
     * @return mixed|string|数组值
     */
    public function addSpecialChar(&$value)
    {
        if ('*' == $value || false !== strpos($value, '(') || false !== strpos($value, '.') || false !== strpos($value, '`') || false !== strpos(strtolower($value), 'as')) {
            //不处理包含* 或者 使用了sql方法, 使用了别名。
        } else {
            $value = '`' . trim($value) . '`';
        }
        if (preg_match("/\b(select|insert|update|delete)\b/i", $value)) {
            $value = preg_replace("/\b(select|insert|update|delete)\b/i", '', $value);
        }

        return $value;
    }

    /**
     * 对字段值两边加引号，以保证数据库安全
     * @param              $value 数组值
     * @param string|数组key $key 数组key
     * @param int          $quotation
     * @return string|数组值
     */
    public function escapeString(&$value, $key = '', $quotation = 1)
    {
        if ($quotation) {
            $q = '\'';
        } else {
            $q = '';
        }
        $value = $q . $value . $q;

        return $value;
    }

    public function halt($message = '', $sql = '')
    {
        res(-1, 'Errno :' . $sql . implode(' ', $this->link->errorInfo()));
    }

    /**
     * @param array|string $string
     * @param string $from_encoding
     * @param string $target_encoding
     * @return false|string
     */
    public function convertEncoding($string, $from_encoding = 'GBK', $target_encoding = 'UTF-8')
    {
        if(is_array($string)){
            foreach ($string as $key => $value){
                $string[$key] = $this->convertEncoding($value, $from_encoding, $target_encoding);
            }
        }else{
            if (function_exists('mb_convert_encoding'))
            {
                $string = mb_convert_encoding($string, str_replace('//IGNORE', '', strtoupper($target_encoding)), $from_encoding);
            }
            else
            {
                if (strtoupper($target_encoding) == 'GB2312' or strtoupper($target_encoding) == 'GBK')
                {
                    $target_encoding .= '//IGNORE';
                }

                $string = iconv($from_encoding, $target_encoding, $string);
            }
        }
        return $string;
    }
}

function baseUrl()
{
    $isHttps = false;
    if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') {
        $isHttps = true;
    } elseif (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        $isHttps = true;
    } elseif (!empty($_SERVER['HTTP_FRONT_END_HTTPS']) && strtolower($_SERVER['HTTP_FRONT_END_HTTPS']) !== 'off') {
        $isHttps = true;
    }

    return ($isHttps ? "https" : "http") . "://" . $_SERVER["HTTP_HOST"] . "/";
}

/**
 * json输出
 * @param      $code
 * @param null $msg
 * @param null $data
 * @param null $extra
 */
function res($code, $msg = null, $data = null, $extra = null)
{
    @header('Content-Type:application/json;charset=UTF-8');
    $output = array(
        'code' => $code,
        'msg'  => $msg,
        'data' => $data
    );
    if (is_array($extra)) {
        foreach ($extra as $key => $val) {
            $output[$key] = $val;
        }
    }
    echo json_encode($output);
    die;
}

function showMessage($msg){
    @header('Content-Type:text/html;charset=UTF-8');
    echo "<div style='padding: 50px;text-align: center;'>$msg</div>";
    die;
}

//错误提示：
$errorCodes = array(
    0    => '正常',
    -1   => '普通错误',
    101  => '没有授权',
    102  => '版本过旧',
    1001 => '访问受限',
    1002 => '没有配置或配置错误',
    1003 => '空间不支持',
);

?>