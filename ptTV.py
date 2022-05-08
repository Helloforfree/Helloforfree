# code: utf-8
'''
本工具是根据PythonistaToolsInstaller改制而来,首次使用建议先刷新直播源！
author:离歌轻轻
1.0 支持播放手工转换后的mkplayer直播源
1.1 支持一键更新mkplayer的国内源或国际源(国际源包含nsfw，需vpn；国内源不包含nsfw),下载后自动转换mkplayer的直播源
'''
import os
import sys
import requests
import functools
import shutil
import json

from six.moves.urllib.parse import urlparse, urljoin

try:
    import ui
    import console
except ImportError:
    import dummyui as ui
    import dummyconsole as console

__version__ = '1.1'
__Author__= '离歌轻轻'

globle_url='https://raw.githubusercontent.com/meishixiu/mkPlayer/master/mkPlayer.conf'
cn_url='https://coding.net/u/Tumblr/p/mkPlayer/git/raw/master/mkPlayer.conf'
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
CONF_FILE = os.path.join(SCRIPT_DIR, 'ptplayer.conf')

class PythonistaToolsRepo(object):

    def __init__(self):
        self.categories = {}
    def get_categories(self):
        with open(CONF_FILE,'r') as file:
            self.categories = json.load(file)
        return self.categories

class PlayButton(object):

    def __init__(self, app, cell, category_name, tool_name, tool_url):
        self.app, self.cell = app, cell
        self.category_name, self.tool_name, self.tool_url = category_name, tool_name, tool_url

        self.btn = ui.Button()
        self.cell.content_view.add_subview(self.btn)
        self.btn.font = ('Helvetica', 12)
        self.btn.background_color = 'white'
        self.btn.border_width = 1
        self.btn.corner_radius = 5
        self.btn.size_to_fit()
        self.btn.width = 58
        self.btn.x = self.app.nav_view.width - self.btn.width - 8
        self.btn.y = (self.cell.height - self.btn.height) / 2.6
        self.btn.title = '播放'
        self.btn.action = functools.partial(self.app.play, self)
        self.btn.tint_color = 'blue'
        self.btn.border_color = 'blue'

class RepoTable(object):
    def __init__(self, app, category_name, category_url):
        self.app = app
        self.category_name = category_name
        self.category_url = category_url
        self.view = ui.TableView(frame=(0, 0, 640, 640))
        self.view.name = category_name
        self.tools_dict = self.category_url
        self.tool_names = sorted(self.tools_dict.keys())
        self.view.data_source = self
        self.view.delegate = self

    def tableview_number_of_sections(self, tableview):
        return 1

    def tableview_number_of_rows(self, tableview, section):
        return len(self.tools_dict)

    def tableview_cell_for_row(self, tableview, section, row):
        cell = ui.TableViewCell('subtitle')
        tool_name = self.tool_names[row]
        tool_url = self.tools_dict[tool_name]
        cell.text_label.text = tool_name
        cell.detail_text_label.text = self.tools_dict[tool_name]
        # TODO: Cell does not increase its height when label has multi lines of text
        cell.detail_text_label.line_break_mode = ui.LB_WORD_WRAP
        cell.detail_text_label.number_of_lines = 0
        
        PlayButton(self.app, cell, self.category_name, tool_name, tool_url)

        return cell

class CategoriesTable(object):
    def __init__(self, app):
        self.app = app
        self.view = ui.TableView(frame=(0, 0, 640, 640))
        self.view.name = '直播源分类'
        self.categories_dict = {}
        self.load()

    @ui.in_background
    def load(self):
        self.app.activity_indicator.start()
        try:
            self.categories_dict = self.app.repo.get_categories()
            categories_listdatasource = ui.ListDataSource(
                category_name
                for category_name in self.categories_dict.keys())
          
            categories_listdatasource.action = self.category_item_tapped
            categories_listdatasource.delete_enabled = False

            self.view.data_source = categories_listdatasource
            self.view.delegate = categories_listdatasource
            self.view.reload()
        except Exception as e:
            console.hud_alert('Failed to load Categories', 'error', 1.0)
        finally:
            self.app.activity_indicator.stop()

    @ui.in_background
    def category_item_tapped(self, sender):
        self.app.activity_indicator.start()
        try:
            category_name = sender.items[sender.selected_row]
            category_url = self.categories_dict[category_name]
            tools_table = RepoTable(self.app, category_name, category_url)
            
            self.app.nav_view.push_view(tools_table.view)
        except Exception as e:
            console.hud_alert('Failed to load repo list', 'error', 1.0)
        finally:
            self.app.activity_indicator.stop()


class PythonistaPlayer(object):

    def __init__(self):
        self.repo = PythonistaToolsRepo()
        self.activity_indicator = ui.ActivityIndicator(flex='LTRB')
        self.activity_indicator.style = 10

        categories_table = CategoriesTable(self)
        self.nav_view = ui.NavigationView(categories_table.view)
        self.nav_view.name = 'Pythonista 直播'
        self.nav_view.add_subview(self.activity_indicator)
        #刷新国际源按钮
        self.btn = ui.Button()
        self.nav_view.add_subview(self.btn)
        self.btn.font = ('Helvetica', 12)
        self.btn.background_color = 'white'
        self.btn.border_width = 1
        self.btn.corner_radius = 5
        self.btn.size_to_fit()
        self.btn.width = 80
        self.btn.height=20
        self.btn.x = self.nav_view.width
        self.btn.y = 20
        self.btn.title = '刷新国际源'
        self.btn.action = functools.partial(self.refresh_globle, self)
        self.btn.tint_color = 'red'
        self.btn.border_color = 'red'
        #刷新国内源按钮
        self.btn = ui.Button()
        self.nav_view.add_subview(self.btn)
        self.btn.font = ('Helvetica', 12)
        self.btn.background_color = 'white'
        self.btn.border_width = 1
        self.btn.corner_radius = 5
        self.btn.size_to_fit()
        self.btn.width = 80
        self.btn.height=20
        self.btn.x = self.nav_view.width
        self.btn.y = 0
        self.btn.title = '刷新国内源'
        self.btn.action = functools.partial(self.refresh_cn, self)
        self.btn.tint_color = 'green'
        self.btn.border_color = 'green'
        
        self.activity_indicator.frame = (0, 0, self.nav_view.width, self.nav_view.height)
        self.activity_indicator.bring_to_front()

    def play(self, btn, sender):
        v = ui.View()
        webview = ui.WebView()
        v.add_subview(webview)
        webview.load_url(btn.tool_url)
        v.frame = (0, 0, self.nav_view.width, self.nav_view.height)
        webview.frame = (0, 0, self.nav_view.width, self.nav_view.height)
        v.present()
    
    def convert(self):
      with open("mkplayer_tmp.conf",'r',encoding='utf8') as file:
        lines=file.readlines()
        result={}
        gname=''
        i=0
        for l in lines:
          l = l.strip('\n').strip(' ')
          if len(l)<=1:
            pass
          elif('[Group]' in l):
            l=l.strip('[Group]')
          elif('groupName=' in l):
            gname=l.strip('groupName=')
            result[gname]=''
            dict={}
          else:
            l=l.split(',')
            dict[l[0]]=l[1]
            result[gname]=dict
          i=i+1
      with open("ptplayer.conf", "w") as file1:
        json.dump(result,file1,indent=2,separators=(',',':'))
      console.hide_activity()
      console.hud_alert('刷新完毕,请重新运行脚本!')
        
    def download(self,url):
        import urllib
        try:
          dir=os.path.abspath('.')
          work_path=os.path.join(dir,'mkplayer_tmp.conf')
          urllib.request.urlretrieve(url,work_path)
          self.convert()
        except :
          console.hud_alert('刷新失败!')
          
    def refresh_globle(self, btn, sender):
        console.alert('', '可能需要几分钟时间,具体取决于网速,刷新国际直播源需挂VPN!', '继续', hide_cancel_button=False)
        self.download(globle_url)
        
    def refresh_cn(self, btn, sender):
        console.alert('', '可能需要几分钟时间,具体取决于网速!', '继续', hide_cancel_button=False)
        self.download(cn_url)   
    
    def launch(self):
        self.nav_view.present('fullscreen')

if __name__ == '__main__':
    ptplayer = PythonistaPlayer()
    ptplayer.launch()
