---
layout: default
---

{% assign pinned_post = site.posts | where: "pin","true" | sort | last %}
{% if pinned_post %}
<p class="post">
    <h1>{{ pinned_post.title }}</h1>
    <div class="entry">
        {{ pinned_post.content }}
    </div>
</p>
{% endif %}

# Who is EightKB?
* Andrew Pruski ([T](https://twitter.com/dbafromthecold)\|[B](https://dbafromthecold.com/))
* Mark Wilkinson ([T](https://twitter.com/m82labs)\|[B](https://markw.dev/))
* Anthony Nocentino ([T](https://twitter.com/nocentino)\|[B](http://www.centinosystems.com/blog))

This event was created to fill a void in the SQL Server conference line-up. While there are many important topics to discuss and things to learn in the SQL Server world, we want this conference to focus on the core components of SQL Server, the things that make SQL Server work.
