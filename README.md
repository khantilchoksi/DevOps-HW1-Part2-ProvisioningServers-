# DevOps-HW1-Part2-ProvisioningServers

> **Name: Khantil Choksi, Unity ID: khchoksi.**  
------------------------------------------------------------
## Architecture Diagram: 
![img](/Architecture.png)
 
 * [Vagrant file](Vagrantfile) for configuring VM.  
------------------------------------------------------------
## Provisioning DigitalOcean Droplet Server:  
  * DigitalOcen API Token Setup:  
      * Generate personal access token from the DigitalOcean account to access the [DigitalOcean API (https://developers.digitalocean.com/documentation/v2/).  
      * Now, set this token as your environment variable:  
        ```
        # Mac/Linux
        export DIGITALOCEANTOKEN="YOUR_DIGITAL_OCEAN_TOKEN"
        # Windows
        setx DIGITALOCEANTOKEN "YOUR_DIGITAL_OCEAN_TOKEN"
        ```  
  * SSH Keys:  
      * Create a new SSH Keys using `ssh-keygen -t rsa` in your host machine.  
      * DigitalOcean allows us to add SSH public keys to the interface so that you can embed your public key into a Droplet at the time of creation. Only the public key is required to take advantage of this functionality. For this, make a `POST` api call to `https://api.digitalocean.com/v2/account/keys` to add SSH key to your digital ocean account. In response, the received key id is used while creating the droplet.  
   * Creating Droplet: 
      Making the POST api call to `https://api.digitalocean.com/v2/droplets` will create a new droplet in a given region, with specified imageId and ssh key id.  
   * SSH into droplet:   
        Now, you can SSH into newly created droplet with the IP address (without requiring password).  
   * Add this node into your inventory file with specified private SSH key file path.    
   * Here is the [Node JS code](digitalocean.js) for provisioning DigitalOcean Droplet / server.

------------------------------------------------------------  
## Provisioning Amazon AWS EC2 Instance Server:     
   * Loading AWS Credentials from the shared credentials file:  
        * Keep your AWS credentials data in a shared file used by SDKs and the command line interface. The SDK for JavaScript automatically searches the shared credentials file for credentials when loading. Where you keep the shared credentials file depends on your operating system:  
      
         ```
          Linux, Unix, and macOS users: ~/.aws/credentials  
          Windows users: C:\Users\USER_NAME\.aws\credentials  
         ```
         ```
          [default]
          aws_access_key_id = <YOUR_ACCESS_KEY_ID>
          aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>
         ```
        * In nodejs application,  
        ```
         var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
         AWS.config.credentials = credentials;
        ```

   * Create *Security Group* for the EC2 instance first and give the inbound ip address to accept the SSH connections from your specified hosts. Here, `0.0.0.0/0` ip is defined to accept the SSH connection from all hosts.    
   * Create the *Key Pair* for the EC2 instance and store the private key generated into your host machine; for direct SSH connection to your EC2 instance.  
   * Create the EC2 instance with the above created Security Group and KeyPair; which will return public DNS name for the server.  
   * Add this node into your inventory file with specified private SSH key file path.   
   * SSH into EC2 instance with this stored private SSH key.   
   * Here is the [Node JS code](aws.js) for provisioning AWS EC2 instance / server.  
   
 -------------------------------------------------------------------------------------  
 
## Ansible Script for configuration management:  

 * [Inventory File](inventory) created from above node js code.
 * [Ansible Script](script.yml) to install Maven, Git, NodeJS, and Java8 to both the provisioned server.    
 
--------------------------------------------------------------------------------------  
 ## [Screencast: Demoing the creation of two servers and configuring them.](https://youtu.be/wpkMLsmGV5c) 
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
  * If we have many servers, maintaining such large entries of nodes in inventory file is cumbersome task.  
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
  * If we don't have a proper configuration management, we won't have a well-ordered system in place, which leads to a developer should not be able to see all of the past system implementations of the business, and can't help to better address future needs and changes to keep the system up to date and running smoothly.  
  * An unreliable system that is constantly down and needing repairs because of a company’s configuration management team is lacking in organization and pro-activeness. If the configuration management is done properly, it should run like the well-oiled machine that it is, ensuring that every department in the company can get their jobs done properly. Increased stability and efficiency of the system will is directly dependent on the proper configuration management of the system.  
  * Proper Configuration Management saves cost with the constant system maintenance, record keeping, and checks and balances to prevent repetition and mistakes, bugs. The organized record keeping of the system itself saves time for developers and reduces wasted money for the company with less money being spent on fixing recurring or nonsensical issues. With an updated system, there is also reduction in risks of potential lawsuits for breaches of security because of outdated software framework, which could possibly be attributed to negligence. 
 
 
### Quick Links:  
  * [Vagrant File of VM](Vagrantfile)
  * [Node JS code for provisioning DigitalOcean server](digitalocean.js)    
  * [Node JS code for provisionig Amazon AWS server](aws.js)  
  * [Ansible Script for configuration](script.yml)
  * [Screencast](https://youtu.be/wpkMLsmGV5c)  

**Thank you!**  
