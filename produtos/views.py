from rest_framework import viewsets
from .models import Produto
from .serializers import ProdutoSerializer

# ViewSet principal — fornece GET, POST, PUT, DELETE automaticamente
class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
