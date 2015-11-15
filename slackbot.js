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

    var storage = {
        set: function(key, value) {
            localStorage.setItem(key, value);
        },
        get: function(key) {
            return localStorage.getItem(key);
        },
        remove: function(key) {
            localStorage.removeItem(key);
        },
        clear: function() {
            localStorage.clear();
        },
        bind: function(elm, key) {
            var self = this;

            elm.val(self.get(key));

            elm.change(function() {
                self.set(key, elm.val());
            })
        }
    };

    function refreshBots() {
        var bots = JSON.parse(storage.get('bots')) || [];

        if (bots.length > 0) {
            var list = '';

            for (var i = 0; i < bots.length; i++) {
                list += '<li class="load-bot" data-index="' + i + '"><a href="javascript:void(0);">';

                if (bots[i].image && bots[i].image.length) {
                    if (bots[i].image.slice(0, 1) == ':' && bots[i].image.slice(-1) == ':') {
                        list += '<b>' + bots[i].image + '</b> ';
                    } else {
                        list += '<img src="' + bots[i].image + '" /> ';
                    }
                }

                list += bots[i].name;
                list += '</a></li>';
            }

            $('#bots').html(list);
        }
    }

    function refreshPageTitle() {
        var botName = $('#name').val();
        document.title = 'Slack Bot Manager';

        if (botName.length) {
            document.title = botName + ' - ' + document.title;
        }
    }

    storage.bind($('#url'), 'url');
    storage.bind($('#target'), 'target');
    storage.bind($('#name'), 'name');
    storage.bind($('#image'), 'image');
    refreshBots();
    refreshPageTitle();

    $('#name').change(function() {
        refreshPageTitle();
    });

    $('#url').popover({
        title: 'Where can I find this?',
        content: [
            'First, create an <a href="https://my.slack.com/services/new/incoming-webhook/">incoming webhook</a>',
            'The channel you choose doesn\'t matter since you override it here.',
            'Once the hook is created you\'ll have access to the url in the <b>Integration Settings</b> section.',
            'Complete help to create an incoming webhook can be found here: <a href="https://api.slack.com/incoming-webhooks">https://api.slack.com/incoming-webhooks</a>'
        ].join('<br /><br />'),
        placement: 'bottom',
        trigger: 'focus',
        html: true
    });

    $('#save-bot').click(function() {
        var bot = {
            name: $('#name').val(),
            image: $('#image').val()
        };

        if (!bot.name.length || !bot.image.length) {
            return;
        }

        var bots = JSON.parse(storage.get('bots')) || [];

        bots.push(bot);

        storage.set('bots', JSON.stringify(bots));

        refreshBots();
    });

    $('.load-bot').click(function() {
        var bots = JSON.parse(storage.get('bots')) || [];

        var bot = bots[$(this).data('index')];

        $('#name').val(bot.name);
        $('#image').val(bot.image);

        storage.set('name', $('#name').val());
        storage.set('image', $('#image').val());
    });

    $('#clear-bots-cache').click(function() {
        storage.remove('bots');
        $('#bots').html('');
    });

    $('#clear-cache').click(function() {
        storage.clear();
        $('#bots').html('');
        $('#url').val('');
        $('#target').val('');
        $('#name').val('');
        $('#image').val('');
        $('#message').val('');
    });

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
