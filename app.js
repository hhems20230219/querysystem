/* 讀取月份下拉 */
async function loadMonths(){
  $('#selYM').empty().append(`<option value="">（全部月份）</option>`);
  try{
    const url = `${API_BASE}?action=months`;
    const res = await fetch(url);
    const data = await res.json();
    if(!data.ok) throw new Error(data.error||'months failed');
    data.months.forEach(m => $('#selYM').append(`<option value="${m}">${m}</option>`));
    // 預設選最新
    if (data.months.length) $('#selYM').val(data.months[data.months.length-1]);
  }catch(e){
    $('#hint').text('載入月份失敗：' + e.message);
  }
}

async function search(){
  const name = $('#txtName').val().trim();
  const ym   = $('#selYM').val();
  $('#panel').hide(); $('#empty').hide(); $('#hint').text('查詢中…');
  if(!name){ $('#hint').text('請先輸入姓名'); return; }

  const qs = new URLSearchParams({ action:'search', name });
  if (ym) qs.set('ym', ym);

  try{
    const res = await fetch(`${API_BASE}?` + qs.toString());
    const data = await res.json();
    if(!data.ok){ $('#hint').text(data.error || '查詢失敗'); $('#empty').show(); return; }

    $('#hint').text('');
    $('#pName').text(data.name);
    $('#panel').show();

    // 如果指定 ym，有 current & recent
    if (data.current != null){
      $('#curHours').text(data.current);
      $('#sum6').text(data.sumRecent || 0);
      const lines = (data.recent||[]).map(o => `${o.ym}：${o.hours} 小時`).join('\n');
      $('#recent').text(lines);
      $('#status').text((data.current>=4 || (data.sumRecent||0)>=24) ? '正常' : '未達標')
                  .removeClass('ok warn')
                  .addClass((data.current>=4 || (data.sumRecent||0)>=24) ? 'ok' : 'warn');
    }else{
      // 沒指定 ym，只顯示有找到人
      $('#curHours').text('—');
      $('#sum6').text('—');
      $('#recent').text('—');
      $('#status').text('—').removeClass('ok warn');
    }
  }catch(e){
    $('#hint').text('查詢錯誤：' + e.message);
    $('#empty').show();
  }
}

$(async function(){
  await loadMonths();
  $('#btnSearch').on('click', search);
  $('#txtName').on('keydown', e => { if(e.key==='Enter') search(); });
});
