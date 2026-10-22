import math
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class delivering consistent envelope metadata:
    page, page_size, total_records, total_pages.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        total_records = self.page.paginator.count
        total_pages = math.ceil(total_records / self.get_page_size(self.request)) if total_records > 0 else 1

        return Response({
            "success": True,
            "message": "Records retrieved successfully.",
            "data": data,
            "meta": {
                "page": self.page.number,
                "page_size": self.get_page_size(self.request),
                "total_records": total_records,
                "total_pages": total_pages,
                "has_next": self.page.has_next(),
                "has_previous": self.page.has_previous()
            }
        })
