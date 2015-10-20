$(function() {
    var log = {
        i: function(message) {
            this.addLog('info', message);
        },
        s: function(message) {
            this.addLog('success', message);
        },
        e: function(message) {
            this.addLog('danger', message);
        },

        addLog: function(level, message) {
            $('#result').html('<span class="text-' + level + '">' + message + '</span>');
            setTimeout(function() {
                $('#result').html('');
            }, 5000);
        }
    };

    $('#send').click(function() {
        var url = $('#url').val();

        if (!url.length) {
            log.e("Url needed!");
            return;
        }

        var data = {
            text: $('#message').val(),
            channel: $('#target').val(),
            username: $('#name').val()
        };

        var image = $('#image').val();

        if (image.slice(0, 1) == ':' && image.slice(-1) == ':') {
            data.icon_emoji = image;
        } else if (image.length > 0) {
            data.icon_url = image;
        }

        $('#sending').show();
        $('#message').val('');

        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            complete: function(response) {
                if (response.status == 200) {
                    log.s(response.responseText);
                } else if (response.status == 500) {
                    log.e(response.responseText);
                } else {
                    log.i(response.responseText);
                }

                $('#sending').hide();
            }
        });
    });
});
