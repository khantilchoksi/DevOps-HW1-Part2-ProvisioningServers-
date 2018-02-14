# DevOps-HW1-Part2-ProvisioningServers

> **Name: Khantil Choksi, Unity ID: khchoksi.**  
------------------------------------------------------------

## Provisioning DigitalOcean Droplet Server:  
* **Setup Steps**:  
  * DigitalOcen API Token Setup:  
      * Generate personal access token from the DigitalOcean account to access the [DigitalOcean API (https://developers.digitalocean.com/documentation/v2/).  
      * Now, set this token as your environment variable:  
        ```
        # Mac/Linux
        export DIGITALOCEANTOKEN="xxx"
        # Windows
        setx DIGITALOCEANTOKEN xxx
        ```  
  * SSH Keys:  
      * Create a new SSH Keys using `ssh-keygen -t rsa` in your host machine.  
      * DigitalOcean allows us to add SSH public keys to the interface so that you can embed your public key into a Droplet at the time of creation. Only the public key is required to take advantage of this functionality. For this, make a `POST` api call to `https://api.digitalocean.com/v2/account/keys` to add SSH key to your digital ocean account. In response, the received key id is used while creating the droplet.  
   * Creating Droplet: 
      Making the POST api call to `https://api.digitalocean.com/v2/droplets` will create a new droplet in a given region, with specified imageId and ssh key id.  
   * SSH into droplet:   
        Now, you can SSH into newly created droplet with the IP address (without requiring password).  
   * Here is the [Node JS code](digitalocean.js) for provisioning server.

------------------------------------------------------------  
## Provisioning Amazon AWS EC2 Instance Server:     
   * Loading AWS Credentials from the shared credentials file:  
        * Keep your AWS credentials data in a shared file used by SDKs and the command line interface. The SDK for JavaScript automatically searches the shared credentials file for credentials when loading. Where you keep the shared credentials file depends on your operating system:  
      
       Linux, Unix, and macOS users: ~/.aws/credentials  
       Windows users: C:\Users\USER_NAME\.aws\credentials  
      
         ```
         [default]
         aws_access_key_id = <YOUR_ACCESS_KEY_ID>
         aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>
         ```
        * In node js, 
        ```
        var credentials = new AWS.SharedIniFileCredentials({profile: 'work-account'});
        AWS.config.credentials = credentials;
        ```

   * Here is the [screencast](https://youtu.be/g_Pa-OYKTzw) demonstrating the creation of Virtual Machine, installing the NodeJS in it and synced folder.  
   * The following steps are to be done in order to perform the above task:  
      1. Install the Baker using homebrew.
       `brew install ottomatica/ottomatica/baker` 
      2. Setup the baker sever, to manage the Baker environments in machine.  
       `baker setup`  
      3. Create a simple Baker file that creates a VM at a given IP address and also install nodejs in your VM.  
  
       ```
            #baker.yml
            ---
            name: baker-computing   
             vm:  
              ip: 192.168.22.19  
             lang:   
               - nodejs9  
       ```      
       4. To Bake the virtual machine called `baker-computing`, the bake2 command is used with the `baker.yml` file path.   
        `baker bake2 --local`   
       5. After Baker finishes creating the VM, ssh to VM using `ssh` command.    
        `baker ssh baker-computing`  
       6. The directory where `baker.yml` is placed in local machine, becomes the synced folder in the VM.   
      
      
### **Using Vagrant:**  
 * Here is my [Vagrantfile](/ComputingEnvironment/Vagrantfile).     
 * Here is the [screencast](https://youtu.be/EfQ_dzlBBmQ) demonstrating the creation of Virtual Machine, installing the NodeJS in it and synced folder.  
 * The following steps are done in order to perform the above task:  
     1. Initialize the virtual machine.
       `vagrant init ubuntu/trusty64` 
     2. Make necessary changes in `Vagrantfile` 
        1. To setup the private network:  
        `config.vm.network "private_network", ip: "192.168.33.19"`  
        2. To enable the synced folder, which allows to edit the files from the host machine.  
        `config.vm.synced_folder "/ComputingWorkshop/local_data", "/home/vagrant/syncdata"` 
        3. Fixing the DNS to use the same as your host OS instead of its own.    
        ```
        config.vm.provider :virtualbox do |vb|  
         # fix crappy dns 
         vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]    
        end    
        ```  
        4. Enable provisioning with a shell script.  
        ```  
        config.vm.provision "shell", inline: <<-SHELL
          apt-get update
          apt-get install -y node
          apt-get install -y nodejs-legacy
        SHELL   
        ```   
     3. Start up the virtual machine.  
     `vagrant up`  
     4. Connect to the machine.  
     `vagrant ssh`  

## Pipeline  
 ### **Hooks:**   
  * Here is my [post-commit file](/Hooks/post-commit).     
  * Here is the [screencast](https://youtu.be/jqxHrFAYi4M) demonstrating the hooks.    
  * The following steps are done in order to perform the above task:  
```
#!/bin/bash
open https://android.com
```  

 1. Create a local repository in the present working directory.  
 `git init`  
 2. Create a post-commit file in the hooks.  
 `nano ./.git/hooks/post-commit`  
 3. Unix/Linux shell knows what kind of interpreter to run the following commands, here it is Bourne Again Shell.  
 `#!/bin/bash`  
 4. Then command `open https://android.com`    
 5. `chmod` is used to change the permission of the files like read, write and executable, here I am changing the post-commit file to give executable permissions.  
 `chmod u+x post-commit`     
 6. Now, whenever, we commit something to this repo, the `post-commit` hooks file will be executed.  

--------------------------------------------------------------------------------------  
 ## Concepts:      
 #### 1. Define idempotency. Give two examples of an idempotent operation and non-idempotent operation.    
  * **Indepotency:** Indepotency of the operations mean that they can be applied multiple times without changing the result beyond the inital application, i.e. applying the same operation multiple times which results in the same final state of the system.  
  * **Examples of Indempotent Operation:**
    * Talking about in the context of "RESTful" web services, it organizes a web application into "resources" and then uses the HTTP verbs of POST, PUT, GET, and DELETE to create, update, read, and delete those resources.
    * Reading the data from the database can be considered as indepotent operation, since this will not cause the database to change. i.e. HTTP GET retrieves a resource, which basically reads data.  
    * Storing and deleting a given set of content are each usually idempotent as long as the request specifies a location or identifier that uniquely identifies that resource and only that resource again in the future. The PUT and DELETE operations with unique identifiers reduce to the simple case of assignment to an immutable variable of either a value or the null-value, respectively, and are idempotent for the same reason; the end result is always the same as the result of the initial execution, even if the response differs. 
    * Another example is, `npm install` operation is also idempotent as it always make sure that the node has been successfully installed on host machine.  
    * We can make ansible playbook tasks indempotent easily with some provisions.
  * **Examples of Non - Indempotent Operations:**
      *  It is possible that a sequence of several requests is non-idempotent, even if all of the methods executed in that sequence are idempotent. (A sequence is idempotent if a single execution of the entire sequence always yields a result that is not changed by a reexecution of all, or part, of that sequence.) For example, a sequence is non-idempotent if its result depends on a value that is later modified in the same sequence.  
      * HTTP POST request can be considered as non-indempotent operation in the context that, everytime you trigger the POST request, it is going to add the new data entry in your database. 
      * PATCH is non-idempotent.
      * Another example is, `ssh-keyscan -H >> ~/.ssh/known_hosts` command for creating SSH fingerprint is not idempotent.   
      
      
 #### 2. Describe several issues related to management of your inventory.   
  * Everytime we have a new provisioned server, we have to update our node entry in the inventory file.  
  * Moreover, the each node entry in the inventory file includes the `ansible_ssh_private_key_file` path. So, in-case if we change the location of `inventory` file or the keys of each node, we have to update the inventory file accordingly.  
  * Additionaly, for the same sever, if there exists many users, we have to manage the different node entries for each user `ansible_ssh_user`.  
  * We can also maintain groups inside the inventory, but after that chaning the node from one group to another will have consequent effects.  
  
 #### 3. Describe two configuration models. What are disadvantages and advantages of each model?    
   * Configuration Models:   
   * **Push Model:** Push deployments by running remote commands via ssh on a set of servers.  
      * **Advantages:**  
          1. **Control:** Everything is synchronous, and under your control. You can see right away is something went wrong, and you can correct it immediately.  
          2. **Simplicity:** In the case of Fabric(push based configuration management system), a 'fabfile' is just a collection of Python functions that copy files over to a remote server and execute commands over ssh on that server; it's all very easy to set up and run.  
      * **Disadvantages:**  
          1. **Lack of full automation:** It's not usually possible to boot a server and have it configure itself without some sort of client/server protocol which push systems don't generally support.  
          2. **Lack of scalability:** When you're dealing with hundreds of servers, a push system starts showing its limits, unless it makes heavy use of threading or multi-processing.     
          
   * **Pull Model:** In pull system, you have a server which acts as a master, and clients which contact the master to find out what they need to do, thus pulling their configuration information from the master. e.g. The systems like Puppet and Chef use a pull-based approach: clients poll a centralized master periodically for updates.    
      * **Advantages:**  
          1. **Full automation capabilities:** It is possible, and indeed advisable, to fully automate the configuration of a newly booted server using a pull deployment system. Using the puppet configuration management system, we can do that.  
          2. **Increased scalability:** In a pull system, clients contact the server independently of each other, so the system as a whole is more scalable than a push system.  
      * **Disadvantages:**  
          1. **Proprietary configuration management language:**  Most  pull system use their own proprietary way of specifying the configuration to be deployed. e.g. Puppet's language looks like a cross between Perl and Ruby, while bcfg2 uses...gasp...XML); this turns out to be a pretty big drawback, because if you're not using the system on a daily basis, you're guaranteed to forget it. Exception: Chef, which uses pure Ruby for its configuration recipes.
          2. **Scalability is still an issue:** Unless you deploy several master servers and keep them in sync, that one master will start getting swamped as you add more and more clients and thus will become bottleneck.  
   
 #### 4. What are some of the consquences of not having proper configuration management?    
  * More cost , less productivity  
  * If we don't have a proper configuration management, we won't have a well-ordered system in place, which leads to a developer should not be able to see all of the past system implementations of the business, and can't help to better address future needs and changes to keep the system up to date and running smoothly.  
  * An unreliable system that is constantly down and needing repairs because of a company’s configuration management team is lacking in organization and pro-activeness. If the configuration management is done properly, it should run like the well-oiled machine that it is, ensuring that every department in the company can get their jobs done properly. Increased stability and efficiency of the system will is directly dependent on the proper configuration management of the system.  
  * Proper Configuration Management saves cost with the constant system maintenance, record keeping, and checks and balances to prevent repetition and mistakes, bugs. The organized record keeping of the system itself saves time for developers and reduces wasted money for the company with less money being spent on fixing recurring or nonsensical issues. With an updated system, there is also reduction in risks of potential lawsuits for breaches of security because of outdated software framework, which could possibly be attributed to negligence. 
 
 
### Quick Links:  
  * Vagrant File of VM
  * Node JS code for provisioning DigitalOcean server:  
  * Node JS code for provisionig Amazon AWS server:  
  * Screencast

**Thank you!**  
