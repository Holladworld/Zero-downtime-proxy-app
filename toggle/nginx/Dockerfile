FROM nginx:alpine

# Install envsubst
RUN apk add --no-cache gettext

# Copy template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'envsubst '"'"'$ACTIVE_POOL $BLUE_BACKEND $GREEN_BACKEND'"'"' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
