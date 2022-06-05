function ContactFormBuild(){

    let formSource = '<div>お名前（必須）</div>';

    formSource += '<div style="margin:0px 0px 16px 0px;"><input style="width:150px;" type="text" id="name" name="name" placeholder="お名前" required value=""></div>';
    formSource += '<div>Eメールアドレス（必須）</div>';
    formSource += '<div style="margin:0px 0px 16px 0px;"><input style="width:275px;" type="email" id="email" name="email" pattern="([a-zA-Z0-9\+_\-]+)(\.[a-zA-Z0-9\+_\-]+)*@([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,6}" placeholder="Eメールアドレス" required></div>';
    formSource += '<div>件名（必須）</div>';
    formSource += '<div style="margin:0px 0px 16px 0px;">';
    formSource += '<select id="subject" name="subject">';
    formSource += '<option value="タイタンシミュレータ登録のお申込み">無制限パスワードの発行</option>';
    formSource += '<option value="タイタンシミュレータに関するお問い合わせ">ご質問・ご報告</option>';
    formSource += '<option value="other">その他</option>';
    formSource += '</select>';
    formSource += '</div>';
    formSource += '<div>メッセージ（任意）</div>';
    formSource += '<div>';
    formSource += '<textarea style="width:500px;height:80px;" class="form-control" id="body" name="body" placeholder="メッセージ" maxlength="500" rows="4"></textarea>';
    formSource += '</div>';
    formSource += '<div id="contactButton">';
    formSource += '<button type="submit">送信</button>';
    formSource += '</div>';

    document.getElementById('contactInputForm').innerHTML = formSource;

    document.getElementById('contact_modal').style.display = 'block';
}

function ContactCompleteFormBuild(){
    let formSource = '<div>メールを送信しました。<br />ご登録いただいたメールアドレスにも確認メールをお送りしました。<br />もし届かない場合はメールアドレスが間違っているかもしれません。</div>';

    document.getElementById('contactInputForm').innerHTML = formSource;

    document.getElementById('contact_modal').style.display = 'block';
}

function ContactErrorFormBuild(n_err, e_err, _name, _email, _subj, _body){
    let formSource = '<div>お名前（必須）</div>';

    if(n_err.length > 0) formSource += '<div class="err_msg">'+ n_err +'</div>';
    formSource += '<div style="margin:0px 0px 16px 0px;"><input style="width:150px;" type="text" id="name" name="name" placeholder="お名前" required value="'+ _name +'"></div>';

    if(e_err.length > 0) formSource += '<div class="err_msg">'+ e_err +'</div>';
    formSource += '<div>Eメールアドレス（必須）</div>';
    formSource += '<div style="margin:0px 0px 16px 0px;"><input style="width:275px;" type="email" id="email" name="email" pattern="([a-zA-Z0-9\+_\-]+)(\.[a-zA-Z0-9\+_\-]+)*@([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,6}" placeholder="Eメールアドレス" required value="'+ _email +'"></div>';
    formSource += '<div>件名（必須）</div>';
    formSource += '<div style="margin:0px 0px 16px 0px;">';
    formSource += '<select id="subject" name="subject">';

    if(_subj == "◆regist") formSource += '<option value="◆regist" selected>無制限パスワードの発行</option>';
    else formSource += '<option value="◆regist">無制限パスワードの発行</option>';

    if(_subj == "claim") formSource += '<option value="claim" selected>ご質問・ご報告</option>';
    else formSource += '<option value="claim">ご質問・ご報告</option>';

    if(_subj == "other") formSource += '<option value="other" selected>その他</option>';
    else formSource += '<option value="other">その他</option>';

    formSource += '</select>';
    formSource += '</div>';
    formSource += '<div>メッセージ（任意）</div>';
    formSource += '<div>';
    formSource += '<textarea style="width:500px;height:80px;" class="form-control" id="body" name="body" placeholder="メッセージ" maxlength="500" rows="4">'+ _body +'</textarea>';
    formSource += '</div>';
    formSource += '<div id="contactButton">';
    formSource += '<button type="submit">送信</button>';
    formSource += '</div>';

    document.getElementById('contactInputForm').innerHTML = formSource;

    document.getElementById('contact_modal').style.display = 'block';
}