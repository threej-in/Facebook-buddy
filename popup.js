start()
async function start(){
    //branding
    document.querySelector('#branding').addEventListener('click',(e)=>{
        chrome.tabs.create({url:e.target.getAttribute('href')})
    })

    //Github link
    document.querySelector('footer img').addEventListener('click',(e)=>{
        chrome.tabs.create({url:'https://github.com/threej-in/Facebook-buddy'})
    })

    //attaching click event to change the view
    document.querySelector('img#changeView').addEventListener('click',(e)=>{
        if(e.target.getAttribute('data-current-view') == 'list'){
            e.target.setAttribute('data-current-view','grid');
            e.target.setAttribute('src','img/list.png');
            document.querySelectorAll('a.username').forEach((e)=>{
                e.style.display = 'none';
            })
            document.querySelector('div#buddyContainer').classList.add('userlist');
        }else if(e.target.getAttribute('data-current-view') == 'grid'){
            e.target.setAttribute('data-current-view','list');
            e.target.setAttribute('src','img/grid.png');
            document.querySelectorAll('a.username').forEach((e)=>{
                e.style.display = 'flex';
            })
            document.querySelector('div#buddyContainer').classList.remove('userlist');
        }
    })

    const [tab] = await chrome.tabs.query(({active:true, currentWindow:true}))
    const fbUrl = new RegExp(/.*facebook.com\/.*/i);
    if(fbUrl.test(tab.url)){
        chrome.scripting.executeScript({
            target : {tabId: tab.id},
            function: getAccounts
        },
        (injectionResults) => {
            [{result}] = injectionResults;
            if(result){
                showAccounts(result)
            }
        });
    }else{
        document.querySelector('div.title').style.display='none';
        document.querySelector('#buddyContainer').innerHTML = "<h3>This extension only works in facebook website.</h3>"
    }
}

function getAccounts(){
    html = document.getElementsByTagName('html')[0].innerHTML;
    start = html.search('chat_sidebar_contact_rankings')+31;
    end = html.indexOf("script", start)-15;
    jsonStr = html.substr(start,end-start);
    jsonStr = jsonStr.substr('',jsonStr.lastIndexOf(']')+1);
    json = JSON.parse(jsonStr);
    $temp = '';
    json.forEach(element => {
        if(element.user != null){
            $temp += 
            `<div class="flexrow" data-link="https://www.facebook.com/profile.php?id=${element.user.id}">
                <img src="${element.user.profile_picture.uri}" title="${element.user.name}">
                <a class="flexrow username" href="https://www.facebook.com/profile.php?id=${element.user.id}"><p>${element.user.name}</p> <img src="img/link.png" width="15px"></a>
            </div>`;
        }
    });
    return $temp;
}

function showAccounts(result){
    document.querySelector('#buddyContainer').innerHTML = result
    document.querySelectorAll('div#buddyContainer div').forEach((el)=>{
        el.addEventListener('click',(event)=>{
            href = el.getAttribute('data-link');
            chrome.tabs.create({url:href})
        });
    });
}

