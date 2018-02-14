# DevOps-HW1-Part2-ProvisioningServers

> **Name: Khantil Choksi, Unity ID: khchoksi.**  
------------------------------------------------------------

## Provisioning DigitalOcean Droplet Server:  
* **Setup Steps**:

## Provisioning Amazon AWS EC2 Instance Server:  
  ### Using Baker:   
   * Here is my [baker.yml file](/ComputingEnvironment/baker.yml).     
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
      * Another example is, `ssh-keyscan -H >> ~/.ssh/known_hosts` command for creating SSH fingerprint is not idempotent.   
      
      
 #### 2. Describe several issues related to management of your inventory.   
  * Everytime we have a new provisioned server, we have to update our node entry in the inventory file.  
  * Moreover, the each node entry in the inventory file includes the `ansible_ssh_private_key_file` path. So, in-case if we change the location of `inventory` file or the keys of each node, we have to update the inventory file accordingly.  
  * Additionaly, for the same sever, if there exists many users, we have to manage the different node entries for each user `ansible_ssh_user`.  
  * We can also maintain groups inside the inventory, but after that chaning the node from one group to another will have consequent effects.  
  
 #### 3. Describe two configuration models. What are disadvantages and advantages of each model?    
   * Configuration Models: 
 #### 4. What are some of the consquences of not having proper configuration management?  
 
 
 
  * Here is the [screencast](https://youtu.be/SrlqOcZf6qE) demonstrating the simple pipelines.    
  * The following steps are done in order to perform the above task: 
   1. `App` directory contains the cloned repo; which is basically your development directory. 
   2. Create an endpoint for our deployment, by creating the following directory structure.  
   ```
   deploy/
     production.git/  
     production-www/  
   ```  
   3. A `bare` git repository is created under `production.git`, that will always have files that reflect the most current state of the repo.  
   `deploy/production-www/ :> git init --bare`  
   4. A `post-receive` hook file has been created at `production.git/hooks`.  It includes the commands to checkout to the production directory, and then install nodejs and starting the server. Also, provide the `post-receive` executable permissions.
   ```
   #!/bin/sh
   GIT_WORK_TREE=deploy/production-www/ git checkout -f
   echo "Pushed to production"
   cd /deploy/production-www/
   npm install
   node main.js 9090  
   ```  
   5. Now, set the remote production to App repository.   
   `git remote add prod file://deploy/production.git`  
   6. Then, after any commit, pushing the changes to the production directory's master branch:   
   `git push prod master`  
   7. You can see the changes reflected in `production-www`, i.e. your production environment.  

**Thank you!**  
