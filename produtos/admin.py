from django.contrib import admin

from .models import Produto
# Register your models here.

admin.site.register(Produto, admin.ModelAdmin, list_display=[ 'nome', 'preco', 'quantidade', 'data_cadastro', 'data_validade'])
